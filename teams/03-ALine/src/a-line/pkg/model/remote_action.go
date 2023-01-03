package model

type RemoteAction struct {
	Name        string                    `yaml:"name"`
	Description string                    `yaml:"description"`
	Author      string                    `yaml:"author"`
	Input       map[string]ActionInputArg `yaml:"input"`
	Runs        ActionRun                 `yaml:"runs"`
}

type ActionInputArg struct {
	Description string `yaml:"description"`
	Default     string `yaml:"default"`
	Required    bool   `yaml:"required"`
}

type ActionRun struct {
	Using string       `yaml:"using"`
	Steps []ActionStep `yaml:"steps"`
}

type ActionStep struct {
	Run   string `yaml:"run"`
	Shell string `yaml:"shell"`
}
