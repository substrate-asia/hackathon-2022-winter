package internal

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"qv.od/internal/app_storage"
	"qv.od/internal/external_apis/cess_rpc_api"
	"qv.od/internal/models"
	"qv.od/internal/site_mgr"
	"qv.od/internal/utils"
)

const (
	AppConfigKey  = "APP_CONFIG"
	CessRpcUrlKey = "CESS_RPC_URL"
)

// InitHandler uses mnemonic words passed in to init the CESS RPC client, then
func InitHandler(ctx *fiber.Ctx) error {
	reqData := new(models.PrepareStorageApiRequest)
	if err := ctx.BodyParser(reqData); err != nil {
		utils.Errorf("parse request body error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("parse request body error: %+v", err))
	}

	config := ctx.Locals(AppConfigKey).(ApiServerConfig)

	cessRpcUrl := ctx.Locals(CessRpcUrlKey).(string)
	cessRpcApi := cess_rpc_api.CessRpcApi{RpcUrl: cessRpcUrl, TempDir: config.TempDataDir}

	var userKey string
	if os.Getenv("SINGLE_USER_MODE") == "" {
		userKey = uuid.New().String()
	} else {
		// single user mode, used for testing purpose only
		userKey = "single-user-mode-test-key"
	}

	if err := cessRpcApi.Init(reqData.MnemonicWords); err != nil {
		utils.Errorf("init cess rpc API error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("init cess rpc API serror: %+v", err))
	}

	fileManager := site_mgr.NewCessFileManager(&cessRpcApi, config.TempDataDir)
	app_storage.Set[site_mgr.SiteManager](userStorageKey(userKey), fileManager)

	return ctx.JSON(map[string]string{"userKey": userKey})
}

func IndexHandler(ctx *fiber.Ctx) error {
	// TODO: Merge this code to some middleware
	userKey := ctx.Get("user-key")
	siteMgr, err := app_storage.Get[site_mgr.SiteManager](userStorageKey(userKey))
	if err != nil {
		// TODO: Create error for user key not existing, indicate API to resend init request
		utils.Errorf("get user site manager error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("get user data error: %+v", err))
	}

	userMetaInfo, err := siteMgr.GetUserMetadata()
	if err != nil {
		e := fmt.Sprintf("get user meta data error: %+v", err)
		utils.Errorf(e)
		return fiber.NewError(fiber.StatusInternalServerError, e)
	}

	utils.Infof("User meta info: %#v", userMetaInfo)
	return ctx.JSON(userMetaInfo)
}

func NewSiteHandler(ctx *fiber.Ctx) error {
	userKey := ctx.Get("user-key")
	siteMgr, err := app_storage.Get[site_mgr.SiteManager](userStorageKey(userKey))
	if err != nil {
		// TODO: Create error for user key not existing, indicate API to resend init request
		utils.Errorf("get user site manager error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("get user data error: %+v", err))
	}

	reqData := new(models.NewSiteRequest)
	if err := ctx.BodyParser(reqData); err != nil {
		return err
	}

	utils.Infof("new site request: %#v", reqData)
	siteInfo, err := siteMgr.CreateSite(reqData.Name)
	if err != nil {
		utils.Errorf("create site error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("create site error: %+v", err))
	}

	return ctx.JSON(siteInfo)
}

func SubscribeSiteHandle(ctx *fiber.Ctx) error {
	userKey := ctx.Get("user-key")
	siteMgr, err := app_storage.Get[site_mgr.SiteManager](userStorageKey(userKey))
	if err != nil {
		// TODO: Create error for user key not existing, indicate API to resend init request
		utils.Errorf("get user site manager error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("get user data error: %+v", err))
	}

	reqData := new(models.SubscribeSiteRequest)
	if err := ctx.BodyParser(reqData); err != nil {
		return err
	}

	siteInfo, err := siteMgr.SubscribeSite(reqData.MetaFileId)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("subscribe site error: %+v", err))
	}

	return ctx.JSON(siteInfo)
}

func UploadFileHandler(ctx *fiber.Ctx) error {
	userKey := ctx.Get("user-key")
	siteMgr, err := app_storage.Get[site_mgr.SiteManager](userStorageKey(userKey))
	if err != nil {
		utils.Errorf("get site manager error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	config := ctx.Locals(AppConfigKey).(ApiServerConfig)
	mediaFile, err := ctx.FormFile("file")
	if err != nil {
		utils.Errorf("load uploaded file error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Create temp directory for uploaded media file
	tmpFile, err := os.CreateTemp(config.TempDataDir, "cess.*")
	if err != nil {
		utils.Errorf("create temp file error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// The file will be uploaded in sync way, so defer remove is not safe here.
	//defer os.Remove(tmpFile.Name())

	err = ctx.SaveFile(mediaFile, tmpFile.Name())
	if err != nil {
		utils.Errorf("save file error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("save file error: %+v", err))
	}

	reqData := &models.NewMediaRequest{}
	if err := ctx.BodyParser(reqData); err != nil {
		utils.Errorf("parse request body error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("parse request body error: %+v", err))
	}

	if reqData.SiteId == "" {
		err := errors.New("missing site_id field")
		utils.Errorf(err.Error())
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	reqData.UploadedAt = time.Now().UnixMilli()

	// Validate whether fileExt is in accepted video list
	//fileExt := path.Ext(mediaFile.Filename)

	siteMgr.UploadMedia(reqData.SiteId, tmpFile.Name(), reqData)

	// TODO: Get file type from upload form and process ffmpeg if required
	return ctx.SendStatus(fiber.StatusOK)
}

func SiteMediaListHandler(ctx *fiber.Ctx) error {
	userKey := ctx.Get("user-key")
	siteMgr, err := app_storage.Get[site_mgr.SiteManager](userStorageKey(userKey))
	if err != nil {
		// TODO: Create error for user key not existing, indicate API to resend init request
		utils.Errorf("get user site manager error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("get user data error: %+v", err))
	}

	siteId := ctx.Params("site_id")

	files, err := siteMgr.SiteMediaList(siteId)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("list site files error: %+v", err))
	}

	return ctx.JSON(files)
}

// ViewMediaHandler handles init media view request, which returns m3u8 file to the player
// If media file found, the index.m3u8 file will be returned and the following video segments request will be replaced to fid provided by storage backend
func ViewMediaHandler(ctx *fiber.Ctx) error {
	userKey := ctx.Params("user_key")
	siteMgr, err := app_storage.Get[site_mgr.SiteManager](userStorageKey(userKey))
	if err != nil {
		// TODO: Create error for user key not existing, indicate API to resend init request
		utils.Errorf("get user site manager error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("get user data error: %+v", err))
	}

	entryFid := ctx.Params("entry_fid")
	mediaEntryContent, err := siteMgr.GetMediaEntry("", entryFid, userKey)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.SendString(mediaEntryContent)
}

func ViewMediaSegHandler(ctx *fiber.Ctx) error {
	userKey := ctx.Params("user_key")
	siteMgr, err := app_storage.Get[site_mgr.SiteManager](userStorageKey(userKey))
	if err != nil {
		// TODO: Create error for user key not existing, indicate API to resend init request
		utils.Errorf("get user site manager error: %+v", err)
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("get user data error: %+v", err))
	}

	fid := ctx.Params("fid")
	utils.Infof("get media segment %s", fid)

	fileContent, err := siteMgr.GetMediaSegment(fid)
	if err != nil {
		utils.Errorf("get media segment %s error: %+v", fid, err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return ctx.Send(fileContent)
}

func ListAllFilesForAccountHandler(ctx *fiber.Ctx) error {
	acctId := ctx.Params("accountId")

	// TODO: Get file list from CESS user meta bucket

	return ctx.SendString(fmt.Sprintf("List files uploaded by account %s", acctId))
}

func userStorageKey(userKey string) string {
	return fmt.Sprintf("%s.site_mgr", userKey)
}
