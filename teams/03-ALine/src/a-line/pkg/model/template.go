package model

type Template struct {
	Id          int    `yaml:"id,omitempty" json:"id"`
	Name        string `yaml:"name,omitempty" json:"name"`
	Description string `yaml:"description,omitempty" json:"description"`
	Tag         string `yaml:"tag,omitempty" json:"tag"`
	ImageName   string `yaml:"imageName,omitempty" json:"imageName"`
}

type TemplateEnglish struct {
	Id                 int    `yaml:"id,omitempty" json:"id"`
	Name               string `yaml:"name,omitempty" json:"name"`
	DescriptionEnglish string `yaml:"descriptionEnglish,omitempty" json:"description"`
	Tag                string `yaml:"tag,omitempty" json:"tag"`
	ImageName          string `yaml:"imageName,omitempty" json:"imageName"`
}

type TemplateChinese struct {
	Id                 int    `yaml:"id,omitempty" json:"id"`
	Name               string `yaml:"name,omitempty" json:"name"`
	DescriptionChinese string `yaml:"descriptionChinese,omitempty" json:"description"`
	Tag                string `yaml:"tag,omitempty" json:"tag"`
	ImageName          string `yaml:"imageName,omitempty" json:"imageName"`
}

type TemplateVo struct {
	Id          int    `yaml:"id" json:"id"`
	Name        string `yaml:"name" json:"name"`
	Description string `yaml:"description" json:"description"`
	Tag         string `yaml:"tag" json:"tag"`
	ImageName   string `yaml:"imageName" json:"imageName"`
	Template    string `yaml:"template" json:"template"`
}

type TemplateDetail struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Yaml        string `json:"yaml"`
}
