package models

type PrepareStorageApiRequest struct {
	MnemonicWords string `json:"mnemonicWords"`
}

type NewSiteRequest struct {
	Name     string         `json:"name"` // Name of this site
	MetaInfo map[string]any // MetaInfo saves uncategorized data
}

type SubscribeSiteRequest struct {
	MetaFileId string `json:"metaFileId"` // site's metadata file id
}

// NewMediaRequest saves media info uploaded by user
type NewMediaRequest struct {
	// Media title
	Title       string `json:"title" form:"title"`
	Description string `json:"description" form:"description"`
	Cover       string `json:"cover" form:"cover"`

	// Additional information for this media, will be saved as k-v format
	ExtraInfo string `json:"extra_info" form:"extra_info"`

	SiteId string `json:"site_id" form:"site_id"`

	UploadedBy string `json:"uploaded_by" form:"uploaded_by"`

	UploadedAt int64 `json:"created_at" form:"created_at"`
}
