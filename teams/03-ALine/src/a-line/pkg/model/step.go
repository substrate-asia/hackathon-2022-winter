package model

type Step struct {
	Name   string            `yaml:"name,omitempty" json:"name"`
	Id     string            `yaml:"id,omitempty" json:"id"`
	Uses   string            `yaml:"uses,omitempty" json:"uses"`
	With   map[string]string `yaml:"with,omitempty" json:"with"`
	RunsOn string            `yaml:"runs-on,omitempty" json:"runsOn"`
	Run    string            `yaml:"run,omitempty" json:"run"`
}
