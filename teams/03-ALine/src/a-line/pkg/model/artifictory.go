package model

/*
Artifactory 构建物
*/
type Artifactory struct {
	Name string `json:"name"`
	Url  string `json:"url"`
}

/*
Report 构建物报告
*/
type Report struct {
	Id   int    `json:"id"`
	Url  string `json:"url"`
	Type int    `json:"type"`
}

type ActionResult struct {
	Artifactorys []Artifactory `json:"artifactorys"`
	Reports      []Report      `json:"reports"`
}
