package define

type PolkValidatorRes struct {
	Code        int               `json:"code"`
	Message     string            `json:"message"`
	GeneratedAt int64             `json:"generated_at"`
	Data        PolkValidatorList `json:"data"`
}

type PolkValidatorList struct {
	List []PolkValidatorItem `json:"list"`
}

type PolkValidatorItem struct {
	RankValidator       int    `json:"rank_validator"`
	BondedNominators    string `json:"bonded_nominators"`
	BondedOwner         string `json:"bonded_owner"`
	CountNominators     int    `json:"count_nominators"`
	ValidatorPrefsValue int    `json:"validator_prefs_value"`
	LatestMining        int    `json:"latest_mining"`
	RewardPoint         int    `json:"reward_point"`
	SessionKey          struct {
		Babe               string `json:"babe"`
		Grandpa            string `json:"grandpa"`
		ImOnline           string `json:"im_online"`
		AuthorityDiscovery string `json:"authority_discovery"`
	} `json:"session_key"`
	StashAccountDisplay struct {
		Address    string `json:"address"`
		Display    string `json:"display"`
		Judgements []struct {
			Index     int    `json:"index"`
			Judgement string `json:"judgement"`
		} `json:"judgements"`
		AccountIndex string `json:"account_index"`
		Identity     bool   `json:"identity"`
		Parent       struct {
			Address   string `json:"address"`
			Display   string `json:"display"`
			SubSymbol string `json:"sub_symbol"`
			Identity  bool   `json:"identity"`
		} `json:"parent"`
	} `json:"stash_account_display"`
	ControllerAccountDisplay struct {
		Address    string `json:"address"`
		Display    string `json:"display"`
		Judgements []struct {
			Index     int    `json:"index"`
			Judgement string `json:"judgement"`
		} `json:"judgements"`
		AccountIndex string `json:"account_index"`
		Identity     bool   `json:"identity"`
		Parent       struct {
			Address   string `json:"address"`
			Display   string `json:"display"`
			SubSymbol string `json:"sub_symbol"`
			Identity  bool   `json:"identity"`
		} `json:"parent"`
	} `json:"controller_account_display"`
	NodeName         string `json:"node_name"`
	RewardAccount    string `json:"reward_account"`
	RewardPotBalance string `json:"reward_pot_balance"`
	GrandpaVote      int    `json:"grandpa_vote"`
	BondedTotal      string `json:"bonded_total"`
}

type CustomValidator struct {
	Address             string  `json:"address"`               //质押账户
	BondedTotal         string  `json:"bonded_total"`          //质押总额
	Identity            bool    `json:"identity"`              //是否认证
	ValidatorPrefsValue string  `json:"validator_prefs_value"` //佣金
	CountNominators     int     `json:"count_nominators"`      //提名人数量
	NominatorsMin       float64 `json:"nominators_min"`        //最小提名人质押
	RewardPoint         int     `json:"reward_point"`          //评分
	Reward              float64 `json:"reward"`                //收益算法
}

type PolkNominatorRes struct {
	Code        int               `json:"code"`
	Message     string            `json:"message"`
	GeneratedAt int64             `json:"generated_at"`
	Data        PolkNominatorData `json:"data"`
}

type PolkNominatorData struct {
	Count int                 `json:"count"`
	List  []PolkNominatorItem `json:"list"`
}

type PolkNominatorItem struct {
	RankNominator  int    `json:"rank_nominator"`
	NominatorStash string `json:"nominator_stash"`
	Bonded         string `json:"bonded"`
	AccountDisplay struct {
		Address    string `json:"address"`
		Display    string `json:"display"`
		Judgements []struct {
			Index     int    `json:"index"`
			Judgement string `json:"judgement"`
		} `json:"judgements"`
		AccountIndex string `json:"account_index"`
		Identity     bool   `json:"identity"`
		Parent       struct {
			Address   string `json:"address"`
			Display   string `json:"display"`
			SubSymbol string `json:"sub_symbol"`
			Identity  bool   `json:"identity"`
		} `json:"parent"`
	} `json:"account_display"`
	ValidatorStash string `json:"validator_stash"`
}

type PolkNominatorInfoRes struct {
	Code        int                   `json:"code"`
	Message     string                `json:"message"`
	GeneratedAt int64                 `json:"generated_at"`
	Data        PolkNominatorInfoData `json:"data"`
}

type PolkNominatorInfoData struct {
	NominatorStash      string `json:"nominator_stash"`
	StashAccountDisplay struct {
		Address    string `json:"address"`
		Display    string `json:"display"`
		Judgements []struct {
			Index     int    `json:"index"`
			Judgement string `json:"judgement"`
		} `json:"judgements"`
		AccountIndex string `json:"account_index"`
		Identity     bool   `json:"identity"`
		Parent       struct {
			Address   string `json:"address"`
			Display   string `json:"display"`
			SubSymbol string `json:"sub_symbol"`
			Identity  bool   `json:"identity"`
		} `json:"parent"`
	} `json:"stash_account_display"`
	StakingInfo struct {
		Controller    string `json:"controller"`
		RewardAccount string `json:"reward_account"`
		RewardDisplay struct {
			Address    string `json:"address"`
			Display    string `json:"display"`
			Judgements []struct {
				Index     int    `json:"index"`
				Judgement string `json:"judgement"`
			} `json:"judgements"`
			AccountIndex string `json:"account_index"`
			Identity     bool   `json:"identity"`
			Parent       struct {
				Address   string `json:"address"`
				Display   string `json:"display"`
				SubSymbol string `json:"sub_symbol"`
				Identity  bool   `json:"identity"`
			} `json:"parent"`
		} `json:"reward_display"`
		ControllerDisplay struct {
			Address    string `json:"address"`
			Display    string `json:"display"`
			Judgements []struct {
				Index     int    `json:"index"`
				Judgement string `json:"judgement"`
			} `json:"judgements"`
			AccountIndex string `json:"account_index"`
			Identity     bool   `json:"identity"`
			Parent       struct {
				Address   string `json:"address"`
				Display   string `json:"display"`
				SubSymbol string `json:"sub_symbol"`
				Identity  bool   `json:"identity"`
			} `json:"parent"`
		} `json:"controller_display"`
	} `json:"staking_info"`
	Bonded string `json:"bonded"`
	Status string `json:"status"`
}

type PolkAccountsRes struct {
	Code        int              `json:"code"`
	Message     string           `json:"message"`
	GeneratedAt int64            `json:"generated_at"`
	Data        PolkAccountsData `json:"data"`
}

type PolkAccountsData struct {
	Count int               `json:"count"`
	List  []PolkAccountItem `json:"list"`
}

type PolkAccountItem struct {
	AccountDisplay struct {
		AccountIndex string `json:"account_index"`
		Address      string `json:"address"`
		Display      string `json:"display"`
		Judgements   []struct {
			Index     int    `json:"index"`
			Judgement string `json:"judgement"`
		} `json:"judgements"`
		Identity bool `json:"identity"`
		Parent   struct {
			Address   string `json:"address"`
			Display   string `json:"display"`
			SubSymbol string `json:"sub_symbol"`
			Identity  bool   `json:"identity"`
		} `json:"parent"`
	} `json:"account_display"`
	Address        string `json:"address"`
	Balance        string `json:"balance"`
	BalanceLock    string `json:"balance_lock"`
	CountExtrinsic int    `json:"count_extrinsic"`
	DeriveToken    struct {
		String struct {
			Token   string `json:"token"`
			Balance string `json:"balance"`
			Locked  string `json:"locked"`
		} `json:"string"`
	} `json:"derive_token"`
	IsErc20       bool   `json:"is_erc20"`
	IsEvmContract bool   `json:"is_evm_contract"`
	KtonBalance   string `json:"kton_balance"`
	KtonLock      string `json:"kton_lock"`
	RegistrarInfo struct {
		RegistrarIndex int    `json:"registrar_index"`
		RegistrarFee   string `json:"registrar_fee"`
	} `json:"registrar_info"`
	RingLock string `json:"ring_lock"`
}

type PolkValidatorInfoRes struct {
	Code        int                   `json:"code"`
	Message     string                `json:"message"`
	GeneratedAt int64                 `json:"generated_at"`
	Data        PolkValidatorInfoData `json:"data"`
}

type PolkValidatorInfoData struct {
	Info PolkValidatorInfoDetail
}

type PolkValidatorInfoDetail struct {
	RankValidator       int    `json:"rank_validator"`
	BondedNominators    string `json:"bonded_nominators"`
	BondedOwner         string `json:"bonded_owner"`
	CountNominators     int    `json:"count_nominators"`
	ValidatorPrefsValue int    `json:"validator_prefs_value"`
	LatestMining        int    `json:"latest_mining"`
	RewardPoint         int    `json:"reward_point"`
	SessionKey          struct {
		Babe               string `json:"babe"`
		Grandpa            string `json:"grandpa"`
		ImOnline           string `json:"im_online"`
		AuthorityDiscovery string `json:"authority_discovery"`
	} `json:"session_key"`
	StashAccountDisplay struct {
		Address    string `json:"address"`
		Display    string `json:"display"`
		Judgements []struct {
			Index     int    `json:"index"`
			Judgement string `json:"judgement"`
		} `json:"judgements"`
		AccountIndex string `json:"account_index"`
		Identity     bool   `json:"identity"`
		Parent       struct {
			Address   string `json:"address"`
			Display   string `json:"display"`
			SubSymbol string `json:"sub_symbol"`
			Identity  bool   `json:"identity"`
		} `json:"parent"`
	} `json:"stash_account_display"`
	ControllerAccountDisplay struct {
		Address    string `json:"address"`
		Display    string `json:"display"`
		Judgements []struct {
			Index     int    `json:"index"`
			Judgement string `json:"judgement"`
		} `json:"judgements"`
		AccountIndex string `json:"account_index"`
		Identity     bool   `json:"identity"`
		Parent       struct {
			Address   string `json:"address"`
			Display   string `json:"display"`
			SubSymbol string `json:"sub_symbol"`
			Identity  bool   `json:"identity"`
		} `json:"parent"`
	} `json:"controller_account_display"`
	GrandpaVote int    `json:"grandpa_vote"`
	BondedTotal string `json:"bonded_total"`
	Status      string `json:"status"`
}

type PolkExtrinsicInfoRes struct {
	Code        int                      `json:"code"`
	Message     string                   `json:"message"`
	GeneratedAt int                      `json:"generated_at"`
	Data        PolkExtrinsicInfoResData `json:"data"`
}

type PolkExtrinsicInfoResData struct {
	BlockTimestamp     int    `json:"block_timestamp"`
	BlockNum           int    `json:"block_num"`
	ExtrinsicIndex     string `json:"extrinsic_index"`
	CallModuleFunction string `json:"call_module_function"`
	CallModule         string `json:"call_module"`
	AccountId          string `json:"account_id"`
	Signature          string `json:"signature"`
	Nonce              int    `json:"nonce"`
	ExtrinsicHash      string `json:"extrinsic_hash"`
	Success            bool   `json:"success"`
}

// 收益模型
type PolkRewardRes struct {
	Code        int    `json:"code"`
	Message     string `json:"message"`
	GeneratedAt int    `json:"generated_at"`
	Data        struct {
		Count int              `json:"count"`
		List  []PolkRewardItem `json:"list"`
	} `json:"data"`
}

// 收益条目
type PolkRewardItem struct {
	Account        string `json:"account"`
	Amount         string `json:"amount"`
	BlockNum       int    `json:"block_num"`
	BlockTimestamp int    `json:"block_timestamp"`
	EventId        string `json:"event_id"`
	EventIdx       int    `json:"event_idx"`
	EventIndex     string `json:"event_index"`
	EventMethod    string `json:"event_method"`
	ExtrinsicHash  string `json:"extrinsic_hash"`
	ExtrinsicIdx   int    `json:"extrinsic_idx"`
	ExtrinsicIndex string `json:"extrinsic_index"`
	ModuleId       string `json:"module_id"`
	Params         string `json:"params"`
	Stash          string `json:"stash"`
}
