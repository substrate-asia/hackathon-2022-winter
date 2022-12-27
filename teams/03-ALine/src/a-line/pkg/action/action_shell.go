package action

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/output"
	"github.com/hamster-shared/a-line/pkg/utils"
	"os"
	"os/exec"
	"strings"
)

// ShellAction 命令工作
type ShellAction struct {
	command  string
	filename string
	ctx      context.Context
	output   *output.Output
}

func NewShellAction(step model.Step, ctx context.Context, output *output.Output) *ShellAction {

	return &ShellAction{
		command: step.Run,
		ctx:     ctx,
		output:  output,
	}
}

func (a *ShellAction) Pre() error {

	stack := a.ctx.Value(STACK).(map[string]interface{})

	data, ok := stack["workdir"]

	var workdir string
	if ok {
		workdir = data.(string)
	} else {
		return errors.New("workdir error")
	}

	workdirTmp := workdir + "_tmp"

	_ = os.MkdirAll(workdirTmp, os.ModePerm)

	a.filename = workdirTmp + "/" + utils.RandSeq(10) + ".sh"

	content := []byte("#!/bin/sh\nset -ex\n" + a.command)
	err := os.WriteFile(a.filename, content, os.ModePerm)

	return err
}

func (a *ShellAction) Hook() (*model.ActionResult, error) {

	a.output.NewStep("shell")

	stack := a.ctx.Value(STACK).(map[string]interface{})

	workdir, ok := stack["workdir"].(string)
	if !ok {
		return nil, errors.New("workdir is empty")
	}
	logger.Infof("shell stack: %v", stack)
	env, ok := stack["env"].([]string)

	commands := []string{"sh", "-c", a.filename}
	val, ok := stack["withEnv"]
	if ok {
		precommand := val.([]string)
		shellCommand := make([]string, len(commands))
		copy(shellCommand, commands)
		commands = append([]string{}, precommand...)
		commands = append(commands, shellCommand...)
	}

	c := exec.CommandContext(a.ctx, commands[0], commands[1:]...) // mac linux
	c.Dir = workdir
	c.Env = append(env, os.Environ()...)

	logger.Debugf("execute shell command: %s", strings.Join(commands, " "))
	a.output.WriteCommandLine(strings.Join(commands, " "))

	stdout, err := c.StdoutPipe()
	if err != nil {
		logger.Errorf("stdout error: %v", err)
		return nil, err
	}
	stderr, err := c.StderrPipe()
	if err != nil {
		logger.Errorf("stderr error: %v", err)
		return nil, err
	}

	go func() {
		for {
			// 检测到 ctx.Done() 之后停止读取
			<-a.ctx.Done()
			if a.ctx.Err() != nil {
				logger.Errorf("shell command error: %v", a.ctx.Err())
				return
			} else {
				p := c.Process
				if p == nil {
					return
				}
				// Kill by negative PID to kill the process group, which includes
				// the top-level process we spawned as well as any subprocesses
				// it spawned.
				//_ = syscall.Kill(-p.Pid, syscall.SIGKILL)
				logger.Info("shell command killed")
				return
			}
		}
	}()

	stdoutScanner := bufio.NewScanner(stdout)
	stderrScanner := bufio.NewScanner(stderr)
	go func() {
		for stdoutScanner.Scan() {
			fmt.Println(stdoutScanner.Text())
			a.output.WriteLine(stdoutScanner.Text())
		}
	}()
	go func() {
		for stderrScanner.Scan() {
			fmt.Println(stderrScanner.Text())
			a.output.WriteLine(stderrScanner.Text())
		}
	}()

	err = c.Start()
	if err != nil {
		logger.Errorf("shell command start error: %v", err)
		return nil, err
	}

	err = c.Wait()
	if err != nil {
		logger.Errorf("shell command wait error: %v", err)
		return nil, err
	}

	logger.Info("execute shell command success")
	return nil, err
}

func (a *ShellAction) Post() error {
	return os.Remove(a.filename)
}
