package internal

// ApiServerConfig saves all configurations used for api server
type ApiServerConfig struct {
	ListenAddr string `json:"listenAddr"`

	// TempDataDir will be used to save uploaded files, intermedia files etc.
	TempDataDir string `json:"dataDir"`

	// Accepted media types (can be processed)
	AcceptVideoTypes map[string]bool
	AcceptAudioTypes map[string]bool
}
