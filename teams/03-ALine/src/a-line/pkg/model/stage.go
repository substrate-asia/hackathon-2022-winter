package model

import (
	"fmt"
	"time"
)

type Stage struct {
	Steps []Step   `yaml:"steps,omitempty" json:"steps"`
	Needs []string `yaml:"needs,omitempty" json:"needs"`
}

type StageDetail struct {
	Name      string    `json:"name"`
	Stage     Stage     `json:"stage"`
	Status    Status    `json:"status"`
	StartTime time.Time `json:"startTime"`
	Duration  int64     `json:"duration"`
}

func NewStageDetail(name string, stage Stage) StageDetail {
	return StageDetail{
		Name:   name,
		Stage:  stage,
		Status: STATUS_NOTRUN,
	}
}

func (s *StageDetail) ToString() string {
	return fmt.Sprintf("StageName: %s, status: %d, StartTime: %s, Duration: %d ", s.Name, s.Status, s.StartTime, s.Duration)
}
