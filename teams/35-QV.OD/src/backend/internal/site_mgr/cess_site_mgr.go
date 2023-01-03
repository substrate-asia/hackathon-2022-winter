package site_mgr

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path"
	"strings"
	"time"

	"github.com/etherlabsio/go-m3u8/m3u8"
	ffmpeg "github.com/u2takey/ffmpeg-go"

	"github.com/pkg/errors"
	"qv.od/internal/external_apis/cess_rpc_api"
	"qv.od/internal/models"
	"qv.od/internal/utils"
)

type CessFileManager struct {
	RpcApi *cess_rpc_api.CessRpcApi

	// TmpDir is the temporary directory for this virtual file manager object
	TmpDir string
}

func (fm *CessFileManager) CreateSite(siteName string) (models.SiteInfo, error) {
	bktName := fm.mustSiteBucketName(utils.RandString(20))
	err := fm.RpcApi.CreateBucket(bktName)
	if err != nil {
		utils.Errorf(err.Error())
		return models.SiteInfo{}, err
	}

	// Create metadata file for new created site
	siteInfo := models.SiteInfo{
		Id:         bktName,
		Name:       siteName,
		Uri:        fmt.Sprintf("cess://%s", bktName),
		MetaFileId: "",
		CreatedAt:  time.Now().UnixMilli(),
		UpdatedAt:  time.Now().UnixMilli(),
	}
	siteInfoBytes, err := json.Marshal(siteInfo)
	if err != nil {
		utils.Errorf(err.Error())
		return models.SiteInfo{}, err
	}
	fid, err := fm.RpcApi.CreateFile(bktName, fm.defaultMetaFileName(), siteInfoBytes, true)
	if err != nil {
		utils.Errorf(err.Error())
		return models.SiteInfo{}, err
	}
	utils.Infof("bucket[%s] meta info file id: %s", bktName, fid)

	// set MetaFileId
	siteInfo.MetaFileId = fid

	// update user meta file
	err = fm.updateUserMetadata(&siteInfo, nil)
	if err != nil {
		utils.Errorf(err.Error())
		return models.SiteInfo{}, err
	}

	return siteInfo, err
}

func (fm *CessFileManager) SubscribeSite(metaFileId string) (models.SiteInfo, error) {
	fileContent, err := fm.RpcApi.GetFileByFid(metaFileId)
	if err != nil {
		utils.Errorf(err.Error())
		return models.SiteInfo{}, err
	}

	var siteInfo models.SiteInfo
	err = json.Unmarshal(fileContent, &siteInfo)
	if err != nil {
		utils.Errorf(err.Error())
		return models.SiteInfo{}, err
	}

	// set MetaFileId
	siteInfo.MetaFileId = metaFileId

	// update user meta file
	err = fm.updateUserMetadata(nil, &siteInfo)
	if err != nil {
		utils.Errorf(err.Error())
		return models.SiteInfo{}, err
	}

	return siteInfo, err
}

func (fm *CessFileManager) InitUserMetadata() error {
	metaBucketName := fm.mustUserMetaBucketName()

	utils.Infof("user meta bucket name: %s", metaBucketName)
	err := fm.RpcApi.CreateBucket(metaBucketName)
	if err != nil {
		utils.Errorf("crate bucket error: %+v", err)
		return err
	}

	initMetaInfo := models.UserMetaInfo{
		SelfSites:       make([]models.SiteInfo, 0),
		SubscribedSites: make([]models.SiteInfo, 0),
		CreatedAt:       time.Now().UnixMilli(),
		UpdatedAt:       time.Now().UnixMilli(),
	}

	data, err := json.Marshal(initMetaInfo)
	if err != nil {
		utils.Errorf("marshal init meta info error: %+v", err)
		return nil
	}

	userMetaFileId, err := fm.RpcApi.CreateFile(metaBucketName, fm.defaultMetaFileName(), data, true)
	if err != nil {
		utils.Errorf("crate user meta file error: %+v", err)
		return err
	}
	fm.RpcApi.UserMetaFileId = userMetaFileId
	return fm.RpcApi.SaveUserMetaInfoId(userMetaFileId)
}

func (fm *CessFileManager) GetUserMetadata() (models.UserMetaInfo, error) {
	bktList, _ := fm.RpcApi.GetBucketList()
	// when there is no buckets, the err will be `empty`, consider skip checking this err
	// if err != nil {
	// 	utils.Errorf(err.Error())
	// 	return models.UserMetaInfo{}, err
	// }

	utils.Infof("Bucket list: %+v", bktList)

	metaBucketName := fm.mustUserMetaBucketName()

	idx := utils.FindElementInList[string](metaBucketName, bktList)
	utils.Infof("user meta bucket name: %s, idx: %d", metaBucketName, idx)
	if idx == -1 {
		// No meta bucket found, create the bucket and upload empty meta content to bucket
		err := fm.InitUserMetadata()
		if err != nil {
			utils.Errorf(err.Error())
			return models.UserMetaInfo{}, err
		}
	} else {
		userMetaFileId, err := fm.RpcApi.LoadUserMetaInfoIdFromCache()
		if err != nil {
			utils.Infof("user meta info id is not found in cache, trying to get from bucket")

			// TODO: Impl this
			bktInfo, err := fm.RpcApi.GetBucketInfo(metaBucketName)
			if err != nil {
				utils.Errorf("get bucket info error: %+v", err)
				return models.UserMetaInfo{}, err
			}

			utils.Infof("Bkt file list: %+v", bktInfo.FileList)
			for _, fid := range bktInfo.FileList {
				fileMetaInfo, err := fm.RpcApi.GetFileMetaInfo(fid)
				if err != nil {
					utils.Errorf("get file meta info for %s error: %+v", fid, err)
					return models.UserMetaInfo{}, err
				}
				utils.Infof("File meta info: %+v", fileMetaInfo)
				if strings.Contains(fileMetaInfo.FileName, fm.defaultMetaFileName()) && strings.EqualFold(fileMetaInfo.State, "active") {
					fm.RpcApi.SaveUserMetaInfoId(fid)
					userMetaFileId = []byte(fid)
					break
				}
			}
		}

		if bytes.Equal(userMetaFileId, []byte("")) {
			err := errors.New("fetch meta file fid error")
			utils.Errorf(err.Error())
			return models.UserMetaInfo{}, err
		}

		utils.Infof("user meta field id: %q", userMetaFileId)
		fm.RpcApi.UserMetaFileId = string(userMetaFileId)
	}

	fileContent, err := fm.RpcApi.GetFileByFid(fm.RpcApi.UserMetaFileId)
	if err != nil {
		utils.Errorf(err.Error())
		return models.UserMetaInfo{}, err
	}

	var userMetaInfo models.UserMetaInfo
	err = json.Unmarshal(fileContent, &userMetaInfo)
	if err != nil {
		utils.Errorf(err.Error())
		return models.UserMetaInfo{}, err
	}

	utils.Infof("File content: %q, struct: %#v", fileContent, userMetaInfo)
	return userMetaInfo, nil
}

func (fm *CessFileManager) GetSiteInfo() (models.SiteInfo, error) {
	//TODO implement me
	panic("implement me")
}

// UploadMedia split medias into segments and upload to specified bucket
// KnownIssue: The bucket
func (fm *CessFileManager) UploadMedia(siteBktName string, mediaPath string, metaData *models.NewMediaRequest) error {
	// TODO: Verify site is existing

	mediaFileName := path.Base(mediaPath)
	segmentsBase := path.Join(fm.TmpDir, fmt.Sprintf("%s.segs", mediaFileName))
	err := os.MkdirAll(segmentsBase, 0755)
	if err != nil {
		utils.Errorf("Create video segments dir error: %+v", err)
		return err
	}

	//defer os.RemoveAll(segmentsBase)

	var outputOpts = ffmpeg.KwArgs{
		"hls_time":             "30",
		"hls_list_size":        "0",
		"hls_segment_filename": fmt.Sprintf("%s/file%%d.ts", segmentsBase)}

	err = ffmpeg.Input(mediaPath).
		Output(fmt.Sprintf("%s/index.m3u8", segmentsBase), outputOpts).
		ErrorToStdOut().Run()

	if err != nil {
		utils.Errorf("split video file error: %+v", err)
		return err
	}

	bucketName := fmt.Sprintf("media.%s", utils.RandString(10))

	mediaMetaData := models.MediaMetaData{
		Id:             bucketName,
		Title:          (*metaData).Title,
		Description:    (*metaData).Description,
		Cover:          (*metaData).Cover,
		AdditionalInfo: map[string]any{},
		NameFidMapping: map[string]string{},
		UploadedBy:     (*metaData).UploadedBy,
		CreatedAt:      time.Now().UnixMilli(),
		UpdatedAt:      time.Now().UnixMilli(),
	}

	err = fm.RpcApi.CreateBucket(bucketName)
	if err != nil {
		utils.Errorf("create bucket error: %+v", err)
		os.RemoveAll(segmentsBase)
		return err
	}

	files, err := os.ReadDir(segmentsBase)
	if err != nil {
		utils.Errorf("os.ReadDir error: %+v", err)
		return err
	}

	for i, f := range files {
		utils.Infof("File %d: %s", i, f.Name())
		fp, err := os.Open(path.Join(segmentsBase, f.Name()))
		if err != nil {
			utils.Errorf("Open file %s error: %+v", f.Name(), err)
			return err
		}

		utils.Infof("uploading file %s to bkt %s", fp.Name(), bucketName)
		if strings.Contains(f.Name(), "m3u8") {
			// index.m3u8 will be changed to fid
			continue
		}

		fid, err := fm.RpcApi.UploadFile(bucketName, fp)
		mediaMetaData.NameFidMapping[f.Name()] = fid[:]
	}
	utils.Infof("Media meta data: %+v", mediaMetaData)

	// Parse m3u8 content and update segments path
	m3u8Path := path.Join(segmentsBase, "index.m3u8")
	playlist, err := m3u8.ReadFile(m3u8Path)
	utils.Infof("Update segments path in m3u8 file: %s, playlist before processing: %+v", m3u8Path, playlist)
	if err != nil {
		utils.Errorf("read m3u8 file error, path: %s, error: %+v", m3u8Path, err)
	}

	utils.Infof("m3u8 play list: %+v", playlist)
	for _, playItem := range playlist.Segments() {
		if fid, ok := mediaMetaData.NameFidMapping[playItem.Segment]; ok {
			playItem.Segment = fmt.Sprintf("/mediasegs/USER_KEY/%s\n", fid)
		}
	}
	utils.Infof("m3u8 play list after processing: %+v", playlist)

	m3u8Fp, err := os.OpenFile(m3u8Path, os.O_RDWR, 0755)
	if err != nil {
		utils.Errorf("open m3u8 file error: %+v", err)
	}

	// Add rand string to avoid dup check
	_, err = m3u8Fp.WriteString(fmt.Sprintf("%s\n# %d - %s", playlist.String(), time.Now().UnixMicro(), utils.RandString(10)))
	if err != nil {
		utils.Errorf("update m3u8 file error: %+v", err)
	}

	fid, err := fm.RpcApi.UploadFile(bucketName, m3u8Fp)
	if err != nil {
		utils.Errorf("upload m3u8 file error: %+v", err)
	}
	_ = m3u8Fp.Close()
	mediaMetaData.NameFidMapping[m3u8Fp.Name()] = fid[:]
	mediaMetaData.EntryFid = fid[:]
	mediaMetaData.CreatedAt = time.Now().UnixMilli()
	mediaMetaData.Scope = "media"

	// Update mediaMetaData info, and upload to media bucket and site bucket
	mediaMetaDataInMediaBucketBytes, err := json.Marshal(mediaMetaData)
	if err != nil {
		utils.Errorf("marshal mediaMetaData error: %+v", err)
		return err
	}

	// Create meta info to media bucket
	mediaFileMetaInfoFid, err := fm.RpcApi.CreateFile(bucketName, fm.defaultMetaFileName(), mediaMetaDataInMediaBucketBytes, false)
	if err != nil {
		utils.Errorf("crate media meta file error: %+v", err)
		return err
	} else {
		utils.Infof("created media meta file %s in %s", mediaFileMetaInfoFid, bucketName)
	}

	mediaMetaData.Scope = "site"
	// Update mediaMetaData info, and upload to media bucket and site bucket
	mediaMetaDataInSiteBytes, err := json.Marshal(mediaMetaData)
	if err != nil {
		utils.Errorf("marshal mediaMetaData error: %+v", err)
		return err
	}

	// Create new media meta file to site bucket.
	siteMediaMetaInfoFid, err := fm.RpcApi.CreateFile(siteBktName, fm.defaultMediaNamePattern(), mediaMetaDataInSiteBytes, false)
	if err != nil {
		utils.Errorf("crate site meta file error: %+v", err)
		return err
	} else {
		utils.Infof("created media meta file %s in %s", siteMediaMetaInfoFid, siteBktName)
	}

	return nil
}

func (fm *CessFileManager) GetMediaEntry(mediaId, entryFid, userKey string) (string, error) {
	utils.Infof("Get file content from fid: %s", entryFid)
	m3u8Content, err := fm.RpcApi.GetFileByFid(entryFid)
	if err != nil {
		utils.Errorf("Get entry file data error, fid: %s, error: %+v", entryFid, err)
		return "", err
	}

	// Parse m3u8 content, get segments list
	playlist, err := m3u8.Read(bytes.NewReader(m3u8Content))
	if err != nil {
		utils.Errorf("read media entry file error, fid: %s, error: %+v", entryFid, err)
	}

	utils.Infof("m3u8 play list: %+v", playlist)
	for _, playItem := range playlist.Segments() {
		playItem.Segment = strings.Replace(playItem.Segment, "USER_KEY", userKey, -1)
	}
	utils.Infof("m3u8 play list after processing: %+v", playlist)

	return playlist.String(), nil
}

func (fm *CessFileManager) GetMediaSegment(fid string) ([]byte, error) {
	return fm.RpcApi.GetFileByFid(fid)
}

func (fm *CessFileManager) SiteMediaList(siteBucketName string) ([]models.MediaMetaData, error) {
	bktInfo, err := fm.RpcApi.GetBucketInfo(siteBucketName)
	if err != nil {
		utils.Errorf("get bucket info error: %+v", err)
		return nil, err
	}

	utils.Infof("bucket file list: %+v", bktInfo.FileList)

	var medias []models.MediaMetaData

	for _, fid := range bktInfo.FileList {
		fileMetaInfo, err := fm.RpcApi.GetFileMetaInfo(fid)
		if err != nil {
			utils.Errorf("get file meta info for %s error: %+v", fid, err)
			continue
		}
		utils.Infof("File meta info: %+v", fileMetaInfo)
		// TODO: Check whethet it can be replaced with GetFileWithSubNameFromBucket function
		if strings.Contains(fileMetaInfo.FileName, fm.defaultMediaNamePattern()) && strings.EqualFold(fileMetaInfo.State, "active") {
			fileContent, err := fm.RpcApi.GetFileByFid(fid)
			if err != nil {
				utils.Errorf(err.Error())
				continue
			}
			var mediaMetaData models.MediaMetaData
			err = json.Unmarshal(fileContent, &mediaMetaData)
			if err != nil {
				utils.Errorf(err.Error())
				continue
			}

			// add
			medias = append(medias, mediaMetaData)
		}
	}

	return medias, nil
}

func NewCessFileManager(api *cess_rpc_api.CessRpcApi, tmpDirectory string) SiteManager {
	return &CessFileManager{RpcApi: api, TmpDir: tmpDirectory}
}

func (fm *CessFileManager) mustUserMetaBucketName() string {
	return fmt.Sprintf("usermeta.%s", fm.RpcApi.MustUserMetaFileIdKey())
}

func (fm *CessFileManager) mustSiteBucketName(siteName string) string {
	return fmt.Sprintf("site.%s", siteName)
}

func (fm *CessFileManager) defaultMetaFileName() string {
	return "meta.json"
}

func (fm *CessFileManager) defaultMediaNamePattern() string {
	return "media.json"
}

func (fm *CessFileManager) updateUserMetadata(newSelfSite, newSubscribedSite *models.SiteInfo) error {
	userMetadata, err := fm.GetUserMetadata()
	if err != nil {
		utils.Errorf(err.Error())
		return err
	}
	if newSelfSite != nil {
		userMetadata.SelfSites = append(userMetadata.SelfSites, *newSelfSite)
	}
	if newSubscribedSite != nil {
		userMetadata.SubscribedSites = append(userMetadata.SubscribedSites, *newSubscribedSite)
	}
	userMetadata.UpdatedAt = time.Now().UnixMilli()

	userMetadataFileId := fm.RpcApi.UserMetaFileId
	_, err = fm.RpcApi.DeleteFile(userMetadataFileId)
	if err != nil {
		utils.Errorf("delete user bucket metadata file error: %v", err)
		return err
	}

	newUserMetadataBytes, err := json.Marshal(userMetadata)
	if err != nil {
		utils.Errorf("marshal user bucket metadata error: %v", err)
		return err
	}

	metaBucketName := fm.mustUserMetaBucketName()
	newFid, err := fm.RpcApi.CreateFile(metaBucketName, fm.defaultMetaFileName(), newUserMetadataBytes, true)
	if err != nil {
		utils.Errorf("create new user bucket metadata file error: %v", err)
		return err
	}

	utils.Infof("new user bucket metadata file id: %s", newFid)
	// update UserMetaFileId to newFid
	fm.RpcApi.UserMetaFileId = newFid
	_ = fm.RpcApi.SaveUserMetaInfoId(newFid)

	return nil
}

// GetFileWithSubNameFromBucket list all files in bucket then return content from first file name contains the sub string
// If no file found, empty byte array and error will be returned
func (fm *CessFileManager) GetFileWithSubNameFromBucket(bucketName string, partialFileName string) ([]byte, error) {
	bktInfo, err := fm.RpcApi.GetBucketInfo(bucketName)
	if err != nil {
		utils.Errorf("get bucket info error, bkt name: %s, err: %+v", bucketName, err)
		return nil, err
	}

	utils.Infof("bucket info: %+v", bktInfo)
	for _, fid := range bktInfo.FileList {
		fileMetaInfo, err := fm.RpcApi.GetFileMetaInfo(fid)
		if err != nil {
			utils.Errorf("get file meta info error, fid: %s", fid)
			continue
		}

		// TODO: New error type for pending file
		if strings.Contains(fileMetaInfo.FileName, partialFileName) && strings.EqualFold(fileMetaInfo.State, "active") {
			fileContent, err := fm.RpcApi.GetFileByFid(fid)
			if err != nil {
				utils.Errorf("get file content error, fid: %s, err: %+v", fid, err)
				return nil, err
			}
			return fileContent, nil
		}
	}

	// TODO: Define error type for this
	return nil, errors.New("not found")
}
