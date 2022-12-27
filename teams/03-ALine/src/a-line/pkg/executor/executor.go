package executor

import (
	"context"
	"fmt"
	"io"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	action2 "github.com/hamster-shared/a-line/pkg/action"
	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/output"
	"github.com/hamster-shared/a-line/pkg/service"
	"github.com/hamster-shared/a-line/pkg/utils"
)

type IExecutor interface {

	// FetchJob 获取任务
	FetchJob(name string) (io.Reader, error)

	// Execute 执行任务
	Execute(id int, job *model.Job) error

	// HandlerLog 处理日志
	HandlerLog(jobId int)

	//SendResultToQueue 发送结果到队列
	SendResultToQueue(channel chan any)

	Cancel(id int, job *model.Job) error
}

type Executor struct {
	cancelMap  map[string]func()
	jobService service.IJobService
}

// FetchJob 获取任务
func (e *Executor) FetchJob(name string) (io.Reader, error) {

	//TODO... 根据 name 从 rpc 或 直接内部调用获取 job 的 pipeline 文件
	job := e.jobService.GetJob(name)
	return strings.NewReader(job), nil
}

// Execute 执行任务
func (e *Executor) Execute(id int, job *model.Job) error {

	// 1. 解析对 pipeline 进行任务排序
	stages, err := job.StageSort()
	jobWrapper := &model.JobDetail{
		Id:     id,
		Job:    *job,
		Status: model.STATUS_NOTRUN,
		Stages: stages,
		ActionResult: model.ActionResult{
			Artifactorys: make([]model.Artifactory, 0),
			Reports:      make([]model.Report, 0),
		},
	}

	if err != nil {
		return err
	}

	// 2. 初始化 执行器的上下文

	env := make([]string, 0)
	env = append(env, "NAME="+job.Name)

	homeDir, _ := os.UserHomeDir()

	engineContext := make(map[string]interface{})
	engineContext["hamsterRoot"] = path.Join(homeDir, "workdir")
	workdir := path.Join(engineContext["hamsterRoot"].(string), job.Name)
	engineContext["workdir"] = workdir

	err = os.MkdirAll(workdir, os.ModePerm)

	engineContext["name"] = job.Name
	engineContext["id"] = fmt.Sprintf("%d", id)
	engineContext["env"] = env

	ctx, cancel := context.WithCancel(context.WithValue(context.Background(), "stack", engineContext))

	// 将取消 hook 记录到内存中，用于中断程序
	e.cancelMap[strings.Join([]string{job.Name, strconv.Itoa(id)}, "/")] = cancel

	// 队列堆栈
	var stack utils.Stack[action2.ActionHandler]

	jobWrapper.Status = model.STATUS_RUNNING
	jobWrapper.StartTime = time.Now()

	executeAction := func(ah action2.ActionHandler, job *model.JobDetail) error {
		if jobWrapper.Status != model.STATUS_RUNNING {
			return nil
		}
		err := ah.Pre()
		if err != nil {
			job.Status = model.STATUS_FAIL
			fmt.Println(err)
			return err
		}
		stack.Push(ah)
		actionResult, err := ah.Hook()
		if actionResult != nil && len(actionResult.Artifactorys) > 0 {
			jobWrapper.Artifactorys = append(jobWrapper.Artifactorys, actionResult.Artifactorys...)
		}
		if actionResult != nil && len(actionResult.Reports) > 0 {
			jobWrapper.Reports = append(jobWrapper.Reports, actionResult.Reports...)
		}
		if err != nil {
			job.Status = model.STATUS_FAIL
			return err
		}
		return nil
	}

	jobWrapper.Output = output.New(job.Name, jobWrapper.Id)

	for index, stageWapper := range jobWrapper.Stages {
		//TODO ... stage 的输出也需要换成堆栈方式
		logger.Info("stage: {")
		logger.Infof("   // %s", stageWapper.Name)
		stageWapper.Status = model.STATUS_RUNNING
		stageWapper.StartTime = time.Now()
		jobWrapper.Stages[index] = stageWapper
		jobWrapper.Output.NewStage(stageWapper.Name)
		e.jobService.SaveJobDetail(jobWrapper.Name, jobWrapper)

		for _, step := range stageWapper.Stage.Steps {
			var ah action2.ActionHandler
			if step.RunsOn != "" {
				ah = action2.NewDockerEnv(step, ctx, jobWrapper.Output)
				err = executeAction(ah, jobWrapper)
				if err != nil {
					break
				}
			}

			if step.Uses == "" || step.Uses == "shell" {
				ah = action2.NewShellAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "git-checkout" {
				ah = action2.NewGitAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "hamster-ipfs" {
				ah = action2.NewIpfsAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "hamster-pinata-ipfs" {
				ah = action2.NewPinataIpfsAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "hamster-artifactory" {
				ah = action2.NewArtifactoryAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "deploy-contract" {
				ah = action2.NewTruffleDeployAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "sol-profiler-check" {
				ah = action2.NewSolProfilerAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "solhint-check" {
				ah = action2.NewSolHintAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "mythril-check" {
				ah = action2.NewMythRilAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "slither-check" {
				ah = action2.NewSlitherAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "deploy-ink-contract" {
				ah = action2.NewInkAction(step, ctx, jobWrapper.Output)
			} else if step.Uses == "workdir" {
				ah = action2.NewWorkdirAction(step, ctx, jobWrapper.Output)
			} else if strings.Contains(step.Uses, "/") {
				ah = action2.NewRemoteAction(step, ctx)
			}
			err = executeAction(ah, jobWrapper)
			if err != nil {
				break
			}
		}

		for !stack.IsEmpty() {
			ah, _ := stack.Pop()
			_ = ah.Post()
		}

		if err != nil {
			stageWapper.Status = model.STATUS_FAIL
		} else {
			stageWapper.Status = model.STATUS_SUCCESS
		}
		dataTime := time.Now().Sub(stageWapper.StartTime)
		stageWapper.Duration = dataTime.Milliseconds()
		jobWrapper.Stages[index] = stageWapper
		e.jobService.SaveJobDetail(jobWrapper.Name, jobWrapper)
		logger.Info("}")
		if err != nil {
			cancel()
			break
		}

	}
	jobWrapper.Output.Done()

	delete(e.cancelMap, job.Name)
	if err == nil {
		jobWrapper.Status = model.STATUS_SUCCESS
	} else {
		jobWrapper.Status = model.STATUS_FAIL
		jobWrapper.Error = err.Error()
	}

	dataTime := time.Now().Sub(jobWrapper.StartTime)
	jobWrapper.Duration = dataTime.Milliseconds()
	e.jobService.SaveJobDetail(jobWrapper.Name, jobWrapper)

	//TODO ... 发送结果到队列
	e.SendResultToQueue(nil)
	//_ = os.RemoveAll(path.Join(engineContext["hamsterRoot"].(string), job.Name))

	return err

}

// HandlerLog 处理日志
func (e *Executor) HandlerLog(jobId int) {

	//TODO ...
}

// SendResultToQueue 发送结果到队列
func (e *Executor) SendResultToQueue(channel chan any) {
	//TODO ...
}

// Cancel 取消
func (e *Executor) Cancel(id int, job *model.Job) error {

	cancel, ok := e.cancelMap[strings.Join([]string{job.Name, strconv.Itoa(id)}, "/")]
	if ok {
		cancel()
	}
	return nil
}
