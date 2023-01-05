package apis

type getValidatorsReq struct {
	Balance float64 `json:"balance" form:"balance"`
}

type validatorsRankReq struct {
	Balance float64 `json:"balance" form:"balance"`
}

type getNominatorInfoReq struct {
	Address string `json:"address" form:"address" binding:"required"`
}

type getAccountsReq struct {
	Address string `json:"address" form:"address" binding:"required"`
}

type saveNominatorReq struct {
	StashAddress     string   `json:"stash_address" form:"stash_address" binding:"required"`
	ValidatorAddress []string `json:"validator_address" form:"validator_address"`
}

type cancelNominatorReq struct {
	StashAddress string `json:"stash_address" form:"stash_address" binding:"required"`
}

type findNominatorReq struct {
	StashAddress string `json:"stash_address" form:"stash_address" binding:"required"`
}

type getValidatorInfoReq struct {
	StashAddress string `json:"stash_address" form:"stash_address" binding:"required"`
}

type saveUnbondedReq struct {
	StashAddress string `json:"stash_address" binding:"required"`
	Amount       string `json:"amount"`
	TxHash       string `json:"tx_hash"`
}

type findUnbondNumsReq struct {
	StashAddress string `json:"stash_address" form:"stash_address" binding:"required"`
}

type delUnBondReq struct {
	StashAddress string `json:"stash_address" form:"stash_address" binding:"required"`
}
