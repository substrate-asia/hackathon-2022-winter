package queue

import (
	model2 "github.com/hamster-shared/a-line/pkg/model"
)

type IQueue interface {
	Push(job *model2.Job, node *model2.Node)
	Listener() chan *model2.Job
}

type Queue struct {
}
