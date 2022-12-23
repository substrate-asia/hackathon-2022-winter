package define

type BaseModel struct {
	CreatedAt int `json:"created_at" gorm:"autoCreateTime"` // 在创建时，如果该字段值为零值，则使用当前时间填充
	UpdatedAt int `json:"updated_at" gorm:"autoUpdateTime"` // 在创建时该字段值为零值或者在更新时，使用当前时间戳秒数填充
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
