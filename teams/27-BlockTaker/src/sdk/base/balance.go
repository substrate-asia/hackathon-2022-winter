package base

type Balance struct {
	Total  string
	Locked string
	Usable string
}

func EmptyBalance() *Balance {
	return &Balance{
		Total:  "0",
		Locked: "0",
		Usable: "0",
	}
}
