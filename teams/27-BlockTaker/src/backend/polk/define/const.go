package define

const (
	HttpAddr = "0.0.0.0:9555"
)

const (
	//ApiHost = "https://polkadot.api.subscan.io"
	ApiHost          = "https://westend.api.subscan.io"
	ApiValidatorsUrl = ApiHost + "/api/scan/staking/validators"   //验证者集合
	ApiValidatorUrl  = ApiHost + "/api/scan/staking/validator"    //验证者信息
	ApiNominatorsUrl = ApiHost + "/api/scan/staking/nominators"   //提名人集合
	ApiNominatorUrl  = ApiHost + "/api/scan/staking/nominator"    //提名人信息
	ApiExtrinsicUrl  = ApiHost + "/api/scan/extrinsic"            //获取交易信息
	ApiRewardUrl     = ApiHost + "/api/scan/account/reward_slash" //收益信息
	ApiSecret        = "d65b0bf337cc422bbd541b3ada3f9a29"
)

const (
	DbPath = "./data.db"
)
