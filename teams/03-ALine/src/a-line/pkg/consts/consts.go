package consts

const (
	PIPELINE_DIR_NAME       = "pipelines"
	JOB_DIR_NAME            = "jobs"
	JOB_DETAIL_DIR_NAME     = "job-details"
	JOB_DETAIL_LOG_DIR_NAME = "job-details-log"
)

const (
	LANG_EN = "en"
	LANG_ZH = "zh"
)

const (
	TRIGGER_MODE = "Manual trigger"
)

const (
	ArtifactoryName = "/artifactory"
	ArtifactoryDir  = PIPELINE_DIR_NAME + "/" + JOB_DIR_NAME
)

const (
	IpfsUploadUrl     = "https://api.ipfs-gateway.cloud/upload"
	CarVersion        = 1
	PinataIpfsUrl     = "https://gateway.pinata.cloud/ipfs/"
	PinataIpfsPinUrl  = "https://api.pinata.cloud/pinning/pinFileToIPFS"
	PinataIpfsJWT     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YTY3ODQ5NC05MmY0LTQ5NTctYWMzYi1iNTY2ZmRjMWM5ZjkiLCJlbWFpbCI6ImFiaW5nNDEwMTc0ODMzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2MDZlZWE4NTg1YTk3ZjQzMGM3ZiIsInNjb3BlZEtleVNlY3JldCI6ImE4ODZkYjNiNDE1ZmM5ODdkYmZkMmFlYzBkODA0NjliMjQwYWFhNGY5NzdjZWQ5NmE4OWY3MzUxZWJlYzYzYzciLCJpYXQiOjE2NzAzMTY3ODB9.WCw_yg3txR8fnFUUmbTFXC3z3pXVmW0OZ0cnWJdtQHI"
	PinataOptionsFmt  = "{\"cidVersion\": 1}"
	PinataMetadataFmt = "{\"name\": \"%s\", \"keyvalues\": {\"company\": \"Hamster\"}}"
)

const (
	SolFileSuffix = ".sol"
)

const (
	CheckName                 = "/check"
	SuffixType                = ".txt"
	SolProfilerCheck          = "sol-profiler "
	SolProfilerCheckOutputDir = "sol_profiler"
	SolHintCheckOutputDir     = "solhint"
	SolHintCheck              = "solhint -f table "
	MythRilCheckOutputDir     = "mythril"
	MythRilCheck              = "docker run --rm -v %s:/tmp mythril/myth analyze /tmp/%s"
	SlitherCheckOutputDir     = "slither"
	SlitherCheck              = "docker run --rm -v %s:/tmp bingjian/solidity_check:slither_091_1_0816 slither /tmp/%s"
)

var InkUrlMap = map[string]string{
	"Local":   "ws://127.0.0.1:9944",
	"Rococo":  "wss://rococo-contracts-rpc.polkadot.io",
	"Shibuya": "wss://rpc.shibuya.astar.network",
	"Shiden":  "wss://rpc.shiden.astar.network",
}
