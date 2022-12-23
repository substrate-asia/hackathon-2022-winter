package define

const (
	HttpAddr = "0.0.0.0:9555"
)

const (
	//ApiHost = "https://polkadot.api.subscan.io"
	ApiHost          = "https://westend.api.subscan.io"
	ApiValidatorsUrl = ApiHost + "/api/scan/staking/validators"
	ApiValidatorUrl  = ApiHost + "/api/scan/staking/validator"
	ApiNominatorsUrl = ApiHost + "/api/scan/staking/nominators"
	ApiNominatorUrl  = ApiHost + "/api/scan/staking/nominator"
	ApiExtrinsicUrl  = ApiHost + "/api/scan/extrinsic"
	ApiSecret        = "d65b0bf337cc422bbd541b3ada3f9a29"
)

const (
	DbPath = "./data.db"
)
