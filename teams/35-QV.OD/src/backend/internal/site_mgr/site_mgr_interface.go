package site_mgr

import "qv.od/internal/models"

// SiteManager defines operations used in the project.
// Currently, the only supported backend is CESS service
// Using interface here allows extending the backend to other services

type SiteManager interface {
	// GetUserMetadata return metadata of current user
	GetUserMetadata() (models.UserMetaInfo, error)

	// GetSiteInfo return metadata for single site
	GetSiteInfo() (models.SiteInfo, error)

	// UploadMedia uploads media to specified site
	UploadMedia(siteId string, mediaPath string, metaData *models.NewMediaRequest) error

	// GetMediaEntry fetches media entry file specified by media ID and entry file id
	GetMediaEntry(mediaId, entryFid, userKey string) (string, error)

	// GetMediaSegment returns segment identified by the fid
	GetMediaSegment(fid string) ([]byte, error)

	// SiteMediaList list all medias of site
	SiteMediaList(siteBucketName string) ([]models.MediaMetaData, error)

	// InitUserMetadata is used for user first access the application,
	// this function creates the storage for user metadata and init default metadata file
	InitUserMetadata() error

	// CreateSite creates site with given name
	CreateSite(siteName string) (models.SiteInfo, error)

	// SubscribeSite subscribe site with site meta file id
	SubscribeSite(metaFileId string) (models.SiteInfo, error)
}
