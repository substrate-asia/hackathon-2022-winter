package models

import chain "qv.od/internal/external_apis/cess_rpc_api/rpc_client"

// UserMetaInfo contains meta info for single user
type UserMetaInfo struct {
	// Site created by self
	SelfSites []SiteInfo `json:"self_sites"`

	// Subscribed list
	SubscribedSites []SiteInfo `json:"subscribed_sites"`

	// Timestamp properties
	CreatedAt int64 `json:"created_at"`
	UpdatedAt int64 `json:"updated_at"`
}

type SiteInfo struct {
	// Unique id for the site
	Id string `json:"id"`

	// Name of the site
	Name string `json:"name"`

	// URI of the site, full URL contains url schema
	Uri string `json:"uri"`

	// MetaFileId saves fid for meta.json file
	MetaFileId string `json:"metaFileId"`

	// Timestamp properties
	CreatedAt int64 `json:"created_at"`
	UpdatedAt int64 `json:"updated_at"`
}

type MediaMetaData struct {
	Id string `json:"id"`

	Title string `json:"title"`

	Description string `json:"description"`

	Cover string `json:"cover"`

	// Additional information for this media, will be saved as k-v format
	AdditionalInfo map[string]any `json:"additional_info"`

	// images fid for media
	Images []string `json:"images"`

	// fid of entry file, should be `index.m3u8` or other entry file for stream media
	EntryFid string `json:"entry_fid"`

	// Saves mapping between original file name and fid, which will help loading of medias in application
	NameFidMapping map[string]string `json:"name_fid_mapping"`

	UploadedBy string `json:"uploaded_by"`

	// Scope used to separate meta file to site and media
	Scope string `json:"scope"`

	// Timestamp properties
	CreatedAt int64 `json:"created_at"`
	UpdatedAt int64 `json:"updated_at"`
}

type BucketDetailInfo struct {
	FileList []string `json:"file_list"`
}

type FileMetaInfo struct {
	Fid        string `json:"fid"`
	Size       uint64 `json:"size"`
	Index      uint32 `json:"index"`
	State      string `json:"state"`
	FileName   string `json:"file_name"`
	BucketName string `json:"bucket_name"`
	UploadAcct string `json:"upload_acct"`

	SliceInfo []chain.BlockInfo `json:"sliceInfo"`
}

func CreateFileMetaInfoFromChainData(fid string, chainMetaInfo *chain.FileMetaInfo) FileMetaInfo {
	rslt := FileMetaInfo{
		Fid:   fid,
		Size:  uint64(chainMetaInfo.Size),
		Index: uint32(chainMetaInfo.Index),
		State: string(chainMetaInfo.State),
	}

	// Get first record from userBriefs and set to MetaInfo
	// TODO: Check why an array is used here
	if len(chainMetaInfo.UserBriefs) > 0 {
		brief := chainMetaInfo.UserBriefs[0]
		rslt.FileName = string(brief.File_name)
		rslt.BucketName = string(brief.Bucket_name)
		rslt.UploadAcct = brief.User.ToHexString()
	}

	rslt.SliceInfo = chainMetaInfo.BlockInfo

	return rslt
}
