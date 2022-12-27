package parameters

type CreatePipeline struct {
	Name string `json:"name"`
	Yaml string `json:"yaml"`
}

type UpdatePipeline struct {
	NewName string `json:"newName"`
	Yaml    string `json:"yaml"`
}

type IdParameter struct {
	Id int `json:"id"`
}
