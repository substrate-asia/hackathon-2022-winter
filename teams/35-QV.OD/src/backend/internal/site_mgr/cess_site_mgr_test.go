package site_mgr

import (
	"fmt"
	"os"
	"qv.od/internal/external_apis/cess_rpc_api"
	"qv.od/internal/utils"
	"testing"
)

const (
	mnemonicWords = "seed laundry smoke stereo legend ecology obtain scheme auction ride family what"
	cessRpcUrl    = "wss://testnet-rpc1.cess.cloud/ws/"
)

func TestCessFileManager_CreateSite(t *testing.T) {
	t.SkipNow()

	// setup
	cessRpcApi := cess_rpc_api.CessRpcApi{RpcUrl: cessRpcUrl}
	if err := cessRpcApi.Init(mnemonicWords); err != nil {
		t.Errorf("init cess rpc API error: %+v", err)
	}
	siteMgr := NewCessFileManager(&cessRpcApi, os.TempDir())

	t.Run("GetUserMetadata", func(t *testing.T) {
		userMetaInfo, err := siteMgr.GetUserMetadata()
		if err != nil {
			t.Errorf("GetUserMetadata Error: %v", err)
		}
		t.Logf("User Metadata: %+v", userMetaInfo)
	})

	siteMetaFileId := ""

	t.Run("CreateSite", func(t *testing.T) {
		bucketName := fmt.Sprintf("unittest-%s", utils.RandString(20))
		siteInfo, err := siteMgr.CreateSite(bucketName)
		if err != nil {
			t.Errorf("CreateSite Error: %v", err)
		}
		t.Logf("New Site Info: %+v", siteInfo)

		siteMetaFileId = siteInfo.MetaFileId
	})

	t.Run("SubscribeSite", func(t *testing.T) {
		siteInfo, err := siteMgr.SubscribeSite(siteMetaFileId)
		if err != nil {
			t.Errorf("SubscribeSite Error: %v", err)
		}
		t.Logf("New Site Info: %+v", siteInfo)
	})

	t.Run("UploadMedia", func(t *testing.T) {

	})

	t.Run("SiteMediaList", func(t *testing.T) {

	})
}
