package executor

import (
	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/pipeline"
	"github.com/hamster-shared/a-line/pkg/service"
)

func NewExecutorClient(channel chan model.QueueMessage, jobService service.IJobService) *ExecutorClient {
	return &ExecutorClient{
		executor: &Executor{
			cancelMap:  make(map[string]func()),
			jobService: jobService,
		},
		channel: channel,
	}
}

type ExecutorClient struct {
	executor IExecutor
	channel  chan model.QueueMessage
}

func (c *ExecutorClient) Main() {
	//1. TODO... 注册节点

	//2. TODO...  gorouting 发送定时心跳

	for { //

		//3. 监听队列
		queueMessage, ok := <-c.channel
		if !ok {
			return
		}

		//4.TODO...，获取job信息

		// TODO ... 计算jobId
		jobName := queueMessage.JobName
		jobId := queueMessage.JobId

		pipelineReader, err := c.executor.FetchJob(jobName)

		if err != nil {
			logger.Error(err)
			continue
		}

		//5. 解析pipeline
		job, err := pipeline.GetJobFromReader(pipelineReader)

		//6. 异步执行pipeline
		go func() {
			var err error
			if queueMessage.Command == model.Command_Start {
				err = c.executor.Execute(jobId, job)
			} else if queueMessage.Command == model.Command_Stop {
				err = c.executor.Cancel(jobId, job)
			}

			if err != nil {

			}
		}()

	}
}

func (c *ExecutorClient) Execute(jobId int, job *model.Job) error {
	return c.executor.Execute(jobId, job)
}
