package cess_rpc_api

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"os"
	"path"
	"strings"
	"time"

	"github.com/CESSProject/cess-oss/configs"
	"github.com/CESSProject/cess-oss/pkg/erasure"
	cesskeyring "github.com/CESSProject/go-keyring"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/pkg/errors"
	"qv.od/internal/external_apis"
	chain "qv.od/internal/external_apis/cess_rpc_api/rpc_client"
	"qv.od/internal/external_apis/cess_rpc_api/rpc_client/local_cache"
	"qv.od/internal/external_apis/cess_rpc_api/rpc_client/node"
	"qv.od/internal/models"
	"qv.od/internal/utils"
)

type CessRpcApi struct {
	RpcUrl string `json:"rpcUrl"`

	// UserMetaFileId saves fid for user meta.json file
	UserMetaFileId string `json:"userMetaFileId"`

	// TempDir indicates temp data dir used for files
	TempDir string `json:"temp_dir"`

	chainClient *chain.Client
	cache       local_cache.Cacher
}

func (api *CessRpcApi) Init(mnemonicWords string) error {
	var err error
	api.chainClient, err = chain.NewChainClient(api.RpcUrl, mnemonicWords, 15*time.Second)
	if err != nil {
		// TODO error message contains chain.NewChainClient() err
		return errors.New(fmt.Sprintf("new chain client error: %+v", err))
	}

	// Prepare temp dir
	if api.TempDir == "" {
		api.TempDir = os.TempDir()
	}

	tmpDirStat, err := os.Stat(api.TempDir)
	if err != nil {
		if os.IsNotExist(err) {
			mkdirErr := os.MkdirAll(api.TempDir, 0755)
			if mkdirErr != nil {
				utils.Errorf("make tmp dir %s error, %+v", api.TempDir, err)
				return mkdirErr
			}
		} else {
			utils.Errorf("stat tmp dir %s error, %+v", api.TempDir, err)
			return err
		}
	}

	if !tmpDirStat.IsDir() {
		utils.Errorf("configured temp dir %s is not directory, exit", api.TempDir)
		return err
	}

	// Prepare cache
	cacheDir := path.Join(api.TempDir, "cache")
	if err := os.RemoveAll(cacheDir); err != nil {
		utils.Errorf("tidy cache dir %s error: %+v", cacheDir, err)
		return err
	}

	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		utils.Errorf("create cache dir %s error: %+v", cacheDir, err)
		return err
	}

	api.cache, err = local_cache.NewCache(cacheDir, 0, 0, "cessSites")
	if err != nil {
		return errors.New(fmt.Sprintf("create cache error: %+v", err))
	}

	if api.chainClient.IsChainClientOk() {
		return nil
	} else {
		return &external_apis.ApiConnectionError{Endpoint: api.RpcUrl}
	}
}

func (api *CessRpcApi) GetBucketList() ([]string, error) {
	fmt.Printf("chianClient: %+v\n", api.chainClient)
	bucketListBytes, err := api.chainClient.GetBucketList(api.chainClient.GetPublicKey())
	if err != nil {
		return nil, err
	}

	buckets := make([]string, len(bucketListBytes))
	for i := 0; i < len(bucketListBytes); i++ {
		buckets[i] = string(bucketListBytes[i][:])
	}

	return buckets, err
}

func (api *CessRpcApi) CreateBucket(bucketName string) error {
	if !IsBucketNameValid(bucketName) {
		return errors.New("Invalid bucket name")
	}

	txHash, err := api.chainClient.CreateBucket(api.chainClient.GetPublicKey(), bucketName)
	utils.Infof("Create bucket transaction hash: %s", txHash)
	return err
}

func (api *CessRpcApi) DeleteBucket(bucketName string) error {
	if !IsBucketNameValid(bucketName) {
		return errors.New("Invalid bucket name")
	}

	txHash, err := api.chainClient.DeleteBucket(api.chainClient.GetPublicKey(), bucketName)
	utils.Infof("Delete bucket transaction hash: %s", txHash)
	return err
}

func (api *CessRpcApi) GetBucketInfo(bucketName string) (models.BucketDetailInfo, error) {
	bucketInfo, err := api.chainClient.GetBucketInfo(api.chainClient.GetPublicKey(), bucketName)
	if err != nil {
		return models.BucketDetailInfo{}, err
	}

	bktDetailInfo := models.BucketDetailInfo{}

	for i := 0; i < len(bucketInfo.Objects_list); i++ {
		bktDetailInfo.FileList = append(bktDetailInfo.FileList, string(bucketInfo.Objects_list[i][:]))
	}

	return bktDetailInfo, nil
}

func (api *CessRpcApi) GetFileMetaInfo(fid string) (models.FileMetaInfo, error) {
	chainFileMetaInfo, err := api.chainClient.GetFileMetaInfo(fid)
	if err != nil {
		return models.FileMetaInfo{}, err
	}

	fileMetaInfo := models.CreateFileMetaInfoFromChainData(fid, &chainFileMetaInfo)

	return fileMetaInfo, nil
}

// GetFileByFid tries to get file content by given fid
func (api *CessRpcApi) GetFileByFid(fid string) ([]byte, error) {
	fileMetaInfo, err := api.chainClient.GetFileMetaInfo(fid)
	if err != nil {
		utils.Errorf("get file meta info error: %+v", err)
		return nil, err
	}

	// TODO: save file to separated file dir
	targetFileName := path.Join(api.TempDir, fid)
	err = api.DownloadFile(fileMetaInfo, targetFileName)
	if err != nil {
		return nil, err
	}

	content, err := os.ReadFile(targetFileName)
	utils.Infof("File name: %s, content length: %d", targetFileName, len(content))
	if err != nil {
		return nil, err
	}
	return content, nil
}

func (api *CessRpcApi) UploadFile(bucketName string, fp *os.File) (string, error) {
	sourceFileName := path.Base(fp.Name())
	sourceFileDir := path.Dir(fp.Name())

	grantor, err := api.chainClient.GetGrantor(api.chainClient.GetPublicKey())
	if err != nil {
		utils.Errorf("get grantor error: %+v", err)
		return "", err
	}

	acctChain, _ := utils.EncodePublicKeyAsCessAccount(grantor[:])
	acctLocal, _ := api.chainClient.GetCessAccount()

	if acctLocal != acctChain {
		err = errors.New("chain account and local are not equal")
		utils.Error(err.Error())
		return "", err
	}

	// Stat file
	fstat, err := os.Stat(fp.Name())
	if err != nil {
		utils.Errorf("stat file error: %+v", err)
		return "", err
	}

	// Calculate reed solomon encoding of file, also split file to chunks
	chunks, dataChunkLen, redundantChunkLen, err := ReedSolomon(fp.Name(), fstat.Size())
	if err != nil {
		utils.Errorf("calc file reed solomon error: %+v", err)
		return "", err
	}

	utils.Infof("src file: %s, chunks: %+v, data chunks len: %d, redundant chunk len: %d", fp.Name(), chunks, dataChunkLen, redundantChunkLen)

	if len(chunks) != dataChunkLen+redundantChunkLen {
		err = errors.New("reed solomon chunk calculation error")
		utils.Error(err.Error())
		return "", nil
	}

	fileMerkleTree, err := CalcMerkleTree(chunks)
	if err != nil {
		err = errors.New("calc merkle tree error")
		utils.Errorf(err.Error())
		return "", err
	}

	// Merkle root hash
	fileMerkleRootHash := hex.EncodeToString(fileMerkleTree.MerkleRoot())

	fileMetaOnChain, err := api.chainClient.GetFileMetaInfo(fileMerkleRootHash)
	if err != nil {
		if err.Error() != chain.ERR_Empty {
			utils.Errorf(err.Error())
			return "", err
		}

		// error is ERR_Empty, which means file not existing on chain, then create it
		cessAccountPublicKey, err := utils.DecodePublicKeyOfCessAccount(acctLocal)
		if err != nil {
			return "", err
		}
		userBrief := chain.UserBrief{
			User:        *api.chainClient.MustAccountIdFromPublicKey(cessAccountPublicKey),
			File_name:   types.Bytes(sourceFileName),
			Bucket_name: types.Bytes(bucketName),
		}

		utils.Infof("UserBrief: %+v", userBrief)

		// Declaration file
		txhash, err := api.chainClient.DeclarationFile(fileMerkleRootHash, userBrief)
		if err != nil || txhash == "" {
			err = errors.New(fmt.Sprintf("declare file error: %+v", err))
			utils.Errorf(err.Error())
			return "", err
		} else {
			utils.Infof("declaration file %s (%s) tx hash: %s", fp.Name(), fileMerkleRootHash, txhash)
		}
	} else {
		if string(fileMetaOnChain.State) == chain.FILE_STATE_ACTIVE {
			utils.Infof("file %s (%s) is already on chain, skip it", fp.Name(), fileMerkleRootHash)
			return fileMerkleRootHash, nil
		}
	}

	// Rename chunks with merkle root hash
	newChunksPath := make([]string, 0)
	newBaseFileName := path.Join(sourceFileDir, fileMerkleRootHash)
	utils.Infof("New base file name: %s", newBaseFileName)

	if err := os.Rename(fp.Name(), newBaseFileName); err != nil {
		utils.Errorf("rename file %s to %s error: %+v", fp.Name(), newBaseFileName, err)
		return "", err
	}
	//defer os.Rename(newBaseFileName, fp.Name())

	if redundantChunkLen == 0 {
		newChunksPath = append(newChunksPath, fileMerkleRootHash)
	} else {
		for i := 0; i < len(chunks); i++ {
			chunkExt := path.Ext(chunks[i])
			newChunkFileName := fileMerkleRootHash + chunkExt
			if err := os.Rename(chunks[i], path.Join(sourceFileDir, newChunkFileName)); err != nil {
				utils.Errorf("rename chunk %s to %s error: %+v", chunks[i], path.Join(sourceFileDir, newChunkFileName), err)
				return "", err
			}
			newChunksPath = append(newChunksPath, newChunkFileName)
		}
	}

	fileSt := node.FileStoreInfo{
		FileId:      fileMerkleRootHash,
		FileSize:    fstat.Size(),
		FileState:   "pending",
		IsUpload:    true,
		IsCheck:     true,
		IsShard:     true,
		IsScheduler: false,
		Miners:      nil,
	}
	val, _ := json.Marshal(&fileSt)
	api.cache.Put([]byte(fileMerkleRootHash), val)

	go api.storeFileTask(newChunksPath, fileMerkleRootHash, sourceFileName, sourceFileDir, fstat.Size())

	return fileMerkleRootHash, nil
}

//func (api *CessRpcApi) UploadFileSync(bucketName string, fp *os.File) (string, error) { }

// CreateFile creates file with given name and content into bucket directly
func (api *CessRpcApi) CreateFile(bucketName string, fileName string, fileContent []byte, override bool) (string, error) {
	tmpFile, err := os.CreateTemp(api.TempDir, fileName)
	if err != nil {
		return "", err
	}
	//defer os.Remove(tmpFile.Name())
	utils.Infof("Created tmp file %#v", tmpFile.Name())

	writeCnt, err := tmpFile.Write(fileContent)
	if err != nil {
		return "", err
	}

	if writeCnt != len(fileContent) {
		return "", errors.New("incomplete write to tmp file")
	}

	return api.UploadFile(bucketName, tmpFile)
}

func (api *CessRpcApi) DeleteFile(fid string) (string, error) {
	txHash, err := api.chainClient.DeleteFile(api.chainClient.GetPublicKey(), fid)

	if err != nil {
		utils.Errorf("delete file error: %+v", err)
		return "", err
	}
	utils.Infof("delete file transaction hash: %s", txHash)
	return txHash, err
}

func (api *CessRpcApi) GetAccount() (string, error) {
	return api.chainClient.GetCessAccount()
}

func (api *CessRpcApi) MustGetAccount() string {
	acct, err := api.chainClient.GetCessAccount()
	if err != nil {
		panic(err)
	}

	return acct
}

func (api *CessRpcApi) storeFileTask(chunkPaths []string, fid, fileName string, fileDir string, fsize int64) {
	defer func() {
		if err := recover(); err != nil {
			utils.Error(err)
		}
	}()

	uploadStateChannel := make(chan string, 1)

	go api.uploadToStorage(uploadStateChannel, chunkPaths, fid, fileDir, fsize)
	for {
		select {
		case result := <-uploadStateChannel:
			if result == "1" {
				go api.uploadToStorage(uploadStateChannel, chunkPaths, fid, fileDir, fsize)
				time.Sleep(time.Second * 6)
			}
			if len(result) > 1 {
				var fileSt node.FileStoreInfo
				existingVal, _ := api.cache.Get([]byte(fid))
				json.Unmarshal(existingVal, &fileSt)
				fileSt.IsScheduler = true
				newValue, _ := json.Marshal(&fileSt)
				api.cache.Put([]byte(fid), newValue)
				go api.TrackFile(fid, fileDir, result)
				return
			}
			if result == "3" {
				utils.Errorf("upload file %+v error", fid)
				return
			}
		}
	}
}

// Upload files to cess storage system
func (api *CessRpcApi) uploadToStorage(ch chan string, chunkPaths []string, fid string, baseDir string, fsize int64) {
	defer func() {
		err := recover()
		if err != nil {
			ch <- "1"
		}
	}()

	utils.Infof("baseDir: %s, chunkPaths: %+v", baseDir, chunkPaths)

	var existFile = make([]string, 0)
	for i := 0; i < len(chunkPaths); i++ {
		_, err := os.Stat(path.Join(baseDir, chunkPaths[i]))
		if err != nil {
			continue
		}
		existFile = append(existFile, chunkPaths[i])
	}

	utils.Infof("Files: %+v", existFile)

	// Generate random string as for sign
	msg := utils.RandString(16)

	kr, _ := cesskeyring.FromURI(api.chainClient.GetMnemonicSeed(), cesskeyring.NetSubstrate{})

	// sign message
	sign, err := kr.Sign(kr.SigningContext([]byte(msg)))
	if err != nil {
		ch <- "1"
		return
	}

	// Get all scheduler
	schedulerList, err := api.chainClient.GetSchedulerList()
	if err != nil {
		ch <- "1"
		return
	}

	utils.RandSlice(schedulerList)

	for i := 0; i < len(schedulerList); i++ {
		//wsUrl := fmt.Sprintf("%d.%d.%d.%d:%d", schedulerList[i].Ip.Value[0], schedulerList[i].Ip.Value[1], schedulerList[i].Ip.Value[2], schedulerList[i].Ip.Value[3], schedulerList[i].Ip.Port)
		wsUrl := "3.88.112.236:15000"
		utils.Infof("upload file to %s", wsUrl)

		conTcp, err := dialTcpServer(wsUrl)
		if err != nil {
			utils.Errorf("dial ws error, url: %s, err: %+v", wsUrl, err)
			continue
		}

		srv := node.NewFileClient(node.NewTcp(conTcp), baseDir, existFile)
		err = srv.SendFile(fid, fsize, api.chainClient.GetPublicKey(), []byte(msg), sign[:])
		if err != nil {
			utils.Errorf("send to ws url %s error, err: %+v", wsUrl, err)
			continue
		}
		ch <- wsUrl
		return
	}
	ch <- "1"
}

func (api *CessRpcApi) downloadFromStorage(filePath string, fileSize int64, mip string) error {
	fsta, err := os.Stat(filePath)
	if err == nil {
		// File with same name and size is existing, return directly
		if fsta.Size() == fileSize {
			return nil
		} else {
			os.Remove(filePath)
		}
	}

	msg := utils.RandString(16)

	kr, _ := cesskeyring.FromURI(api.chainClient.GetMnemonicSeed(), cesskeyring.NetSubstrate{})
	// sign message
	sign, err := kr.Sign(kr.SigningContext([]byte(msg)))
	if err != nil {
		return err
	}

	tcpAddr, err := net.ResolveTCPAddr("tcp", mip)
	if err != nil {
		return err
	}

	conTcp, err := net.DialTCP("tcp", nil, tcpAddr)
	if err != nil {
		return err
	}
	utils.Infof("download from storage to file: %s", filePath)
	return node.NewFileClient(node.NewTcp(conTcp), path.Dir(filePath), nil).RecvFile(path.Base(filePath), fileSize, api.chainClient.GetPublicKey(), []byte(msg), sign[:])
}

func dialTcpServer(address string) (*net.TCPConn, error) {
	tcpAddr, err := net.ResolveTCPAddr("tcp", address)
	if err != nil {
		return nil, err
	}
	dialer := net.Dialer{Timeout: configs.Tcp_Dial_Timeout}
	netCon, err := dialer.Dial("tcp", tcpAddr.String())
	if err != nil {
		return nil, err
	}
	conTcp, ok := netCon.(*net.TCPConn)
	if !ok {
		return nil, errors.New("network conversion failed")
	}
	return conTcp, nil
}

func (api *CessRpcApi) TrackFile(fid, baseDir, scheduleServer string) {
	var fileSt node.FileStoreInfo
	for {
		time.Sleep(time.Second * 10)
		val, _ := api.cache.Get([]byte(fid))
		json.Unmarshal(val, &fileSt)

		if fileSt.FileState == chain.FILE_STATE_ACTIVE {
			return
		}

		conTcp, err := dialTcpServer(scheduleServer)
		if err != nil {
			continue
		}

		srv := node.NewFileClient(node.NewTcp(conTcp), baseDir, nil)
		err = srv.SendFileSt(fid, api.cache)
	}
}

func (api *CessRpcApi) SaveUserMetaInfoId(fid string) error {
	utils.Infof("save user meta info id: %s to %s", fid, fmt.Sprintf("%q.meta.json.fid", api.MustUserMetaFileIdKey()))
	return api.cache.Put([]byte(fmt.Sprintf("%q.meta.json.fid", api.MustUserMetaFileIdKey())), []byte(fid))
}

func (api *CessRpcApi) LoadUserMetaInfoIdFromCache() ([]byte, error) {
	userMetaFidKey := fmt.Sprintf("%q.meta.json.fid", api.MustUserMetaFileIdKey())
	existing, err := api.cache.Has([]byte(userMetaFidKey))
	if err != nil {
		utils.Errorf("load user meta info id error: %+v", err)
		return nil, err
	}

	if existing {
		utils.Infof("load user meta info id from cache, key: %s", fmt.Sprintf("%q.meta.json.fid", api.MustUserMetaFileIdKey()))
		return api.cache.Get([]byte(userMetaFidKey))
	} else {
		return nil, errors.New("not found")
	}
}

func (api *CessRpcApi) DownloadFile(fileMetaInfo chain.FileMetaInfo, targetPath string) error {
	utils.Infof("downloading file to %s", targetPath)
	r := len(fileMetaInfo.BlockInfo) / 3
	d := len(fileMetaInfo.BlockInfo) - r
	downCount := 0

	utils.Infof("block info size: %d, data: %+v", len(fileMetaInfo.BlockInfo), fileMetaInfo.BlockInfo)
	utils.Infof("r: %d, d: %d", r, d)

	// TODO: Change this tmp dir to specified data dir
	baseDir := path.Dir(targetPath)
	fileName := path.Base(targetPath)

	for i := 0; i < len(fileMetaInfo.BlockInfo); i++ {
		// Download the file from the scheduler service
		fname := path.Join(baseDir, string(fileMetaInfo.BlockInfo[i].BlockId[:]))

		// For only single block, the number index prefix should be removed
		if len(fileMetaInfo.BlockInfo) == 1 {
			fname = fname[:(len(fname) - 4)]
		}
		mip := fmt.Sprintf("%d.%d.%d.%d:%d", fileMetaInfo.BlockInfo[i].MinerIp.Value[0], fileMetaInfo.BlockInfo[i].MinerIp.Value[1], fileMetaInfo.BlockInfo[i].MinerIp.Value[2], fileMetaInfo.BlockInfo[i].MinerIp.Value[3], fileMetaInfo.BlockInfo[i].MinerIp.Port)
		utils.Infof("Prepare to download file from mip %s to %s, size: %d", mip, fname, int64(fileMetaInfo.BlockInfo[i].BlockSize))
		err := api.downloadFromStorage(fname, int64(fileMetaInfo.BlockInfo[i].BlockSize), mip)
		if err != nil {
			utils.Errorf("downloading %drd shard err: %v", i, err)
		} else {
			downCount++
		}
		if downCount >= d {
			break
		}
	}

	utils.Infof("before rs restore")
	err := erasure.ReedSolomon_Restore(baseDir, fileName, d, r, uint64(fileMetaInfo.Size))
	if err != nil {
		utils.Errorf("ReedSolomon restore error %+v", err)
		return err
	}
	utils.Infof("after rs restore, r: %d", r)

	if r > 0 {
		fstat, err := os.Stat(targetPath)
		if err != nil {
			utils.Errorf("state file %s error: %+v", targetPath, err)
			return err
		}

		if uint64(fstat.Size()) > uint64(fileMetaInfo.Size) {
			tempfile := targetPath + ".temp"
			copyFileWithSpecifiedSize(targetPath, tempfile, int64(fileMetaInfo.Size))
			os.Remove(targetPath)
			os.Rename(tempfile, targetPath)
		}
	}
	return nil
}

func copyFileWithSpecifiedSize(src, dst string, length int64) error {
	srcFile, err := os.OpenFile(src, os.O_RDONLY, os.ModePerm)
	if err != nil {
		return err
	}
	defer srcFile.Close()
	targetFile, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, os.ModePerm)
	if err != nil {
		return err
	}
	defer targetFile.Close()

	var buf = make([]byte, 64*1024)
	var count int64
	for {
		n, err := srcFile.Read(buf)
		if err != nil && err != io.EOF {
			return err
		}
		if n == 0 {
			break
		}
		count += int64(n)
		if count < length {
			targetFile.Write(buf[:n])
		} else {
			tail := count - length
			if n >= int(tail) {
				targetFile.Write(buf[:(n - int(tail))])
			}
		}
	}

	return nil
}

func (api *CessRpcApi) MustUserMetaFileIdKey() string {
	acctName, err := api.GetAccount()
	if err != nil {
		panic(err)
	}
	return strings.ToLower(acctName)
}
