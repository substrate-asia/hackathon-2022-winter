package pipeline

import (
	"github.com/hamster-shared/a-line/pkg/model"
	"gopkg.in/yaml.v2"
	"io"
	"os"
)

// GetJob 根据文件获取job信息
func GetJob(path string) (*model.Job, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	return GetJobFromReader(file)
}

// GetJobFromReader 根据流获取Job 信息
func GetJobFromReader(reader io.Reader) (*model.Job, error) {
	yamlFile, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}
	var job model.Job

	err = yaml.Unmarshal(yamlFile, &job)

	return &job, err
}
