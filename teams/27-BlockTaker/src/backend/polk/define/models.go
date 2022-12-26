package define

type BaseModel struct {
	CreatedAt int `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt int `json:"updated_at" gorm:"autoUpdateTime"`
}

type ModelNominator struct {
	ID               int64  `json:"id" gorm:"primary_Key;AUTO_INCREMENT"`
	StashAddress     string `json:"stash_address"`
	ValidatorAddress string `json:"validator_address"`
	BaseModel
}

func (t *ModelNominator) TableName() string {
	return "nominator"
}

type ModelBonded struct {
	ID           int64  `json:"id" gorm:"primary_Key;AUTO_INCREMENT"`
	StashAddress string `json:"stash_address"`
	TxHash       string `json:"tx_hash"`
	Amount       string `json:"amount"`
	Status       int    `json:"status"`
	BaseModel
}

func (t *ModelBonded) TableName() string {
	return "bond"
}
