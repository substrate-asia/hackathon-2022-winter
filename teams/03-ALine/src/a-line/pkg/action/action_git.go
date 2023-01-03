package action

import (
	"context"
	"fmt"
	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/output"
	"os"
	"os/exec"
	"strings"
)

// GitAction git clone
type GitAction struct {
	repository string
	branch     string
	workdir    string
	output     *output.Output
	ctx        context.Context
}

func NewGitAction(step model.Step, ctx context.Context, output *output.Output) *GitAction {
	return &GitAction{
		repository: step.With["url"],
		branch:     step.With["branch"],
		ctx:        ctx,
		output:     output,
	}
}

func (a *GitAction) Pre() error {
	a.output.NewStep("git")

	stack := a.ctx.Value(STACK).(map[string]interface{})
	a.workdir = stack["workdir"].(string)

	_, err := os.Stat(a.workdir)
	if err != nil {
		err = os.MkdirAll(a.workdir, os.ModePerm)
		if err != nil {
			return err
		}

		command := "git init " + a.workdir
		_, err = a.ExecuteStringCommand(command)
		if err != nil {
			return err
		}
	}

	//TODO ... 检验 git 命令是否存在
	return nil
}

func (a *GitAction) Hook() (*model.ActionResult, error) {

	stack := a.ctx.Value(STACK).(map[string]interface{})

	logger.Infof("git stack: %v", stack)

	// before
	//commands := []string{"git", "clone", "--progress", a.repository, "-b", a.branch, pipelineName}
	//err := a.ExecuteCommand(commands)
	//if err != nil {
	//	return nil, err
	//}

	command := "git rev-parse --is-inside-work-tree"
	out, err := a.ExecuteStringCommand(command)
	a.output.WriteLine(out)
	if err != nil {

		command = "git init"
		_, err = a.ExecuteStringCommand(command)
		if err != nil {
			return nil, err
		}

	}

	command = "git config remote.origin.url  " + a.repository
	out, err = a.ExecuteStringCommand(command)
	a.output.WriteLine(out)
	if err != nil {
		return nil, err
	}

	command = "git config --add remote.origin.fetch +refs/heads/*:refs/remotes/origin/*"
	out, err = a.ExecuteStringCommand(command)
	a.output.WriteLine(out)
	if err != nil {
		return nil, err
	}

	command = "git config remote.origin.url " + a.repository
	out, err = a.ExecuteStringCommand(command)
	a.output.WriteLine(out)
	if err != nil {
		return nil, err
	}

	command = "git fetch --tags --progress " + a.repository + " +refs/heads/*:refs/remotes/origin/*"
	out, err = a.ExecuteStringCommand(command)
	a.output.WriteLine(out)
	if err != nil {
		return nil, err
	}

	command = fmt.Sprintf("git rev-parse refs/remotes/origin/%s^{commit}", a.branch)
	commitId, err := a.ExecuteStringCommand(command)
	if err != nil {
		return nil, err
	}

	command = "git config core.sparsecheckout "
	out, _ = a.ExecuteStringCommand(command)
	a.output.WriteLine(out)

	command = fmt.Sprintf("git checkout -f %s", commitId)
	out, err = a.ExecuteStringCommand(command)
	a.output.WriteLine(out)
	if err != nil {
		return nil, err
	}

	command = "git branch -a -v --no-abbrev"
	out, err = a.ExecuteStringCommand(command)
	a.output.WriteLine(out)
	if err != nil {
		return nil, err
	}

	if containsBranch(out, a.branch) {
		command = fmt.Sprintf("git branch -D  %s", a.branch)
		out, err = a.ExecuteStringCommand(command)
		logger.Debug(out)
		if err != nil {
			return nil, err
		}
	}

	command = fmt.Sprintf("git checkout -b %s %s", a.branch, commitId)
	out, err = a.ExecuteStringCommand(command)
	a.output.WriteLine(out)
	if err != nil {
		return nil, err
	}

	//c := exec.CommandContext(a.ctx, commands[0], commands[1:]...) // mac linux
	//c.Dir = hamsterRoot
	//logger.Debugf("execute git clone command: %s", strings.Join(commands, " "))
	//a.output.WriteCommandLine(strings.Join(commands, " "))
	//
	//stdout, err := c.StdoutPipe()
	//if err != nil {
	//	logger.Errorf("stdout error: %v", err)
	//	return nil, err
	//}
	//stderr, err := c.StderrPipe()
	//if err != nil {
	//	logger.Errorf("stderr error: %v", err)
	//	return nil, err
	//}
	//
	//go func() {
	//	for {
	//		// 检测到 ctx.Done() 之后停止读取
	//		<-a.ctx.Done()
	//		if a.ctx.Err() != nil {
	//			logger.Errorf("git clone error: %v", a.ctx.Err())
	//			return
	//		} else {
	//			p := c.Process
	//			if p == nil {
	//				return
	//			}
	//			// Kill by negative PID to kill the process group, which includes
	//			// the top-level process we spawned as well as any subprocesses
	//			// it spawned.
	//			//_ = syscall.Kill(-p.Pid, syscall.SIGKILL)
	//			logger.Info("git clone process killed")
	//			return
	//		}
	//	}
	//}()
	//
	//stdoutScanner := bufio.NewScanner(stdout)
	//stderrScanner := bufio.NewScanner(stderr)
	//go func() {
	//	for stdoutScanner.Scan() {
	//		fmt.Println(stdoutScanner.Text())
	//		a.output.WriteLine(stdoutScanner.Text())
	//	}
	//}()
	//go func() {
	//	for stderrScanner.Scan() {
	//		fmt.Println(stderrScanner.Text())
	//		a.output.WriteLine(stderrScanner.Text())
	//	}
	//}()
	//
	//err = c.Start()
	//if err != nil {
	//	logger.Errorf("git clone error: %v", err)
	//	return nil, err
	//}
	//
	//err = c.Wait()
	//if err != nil {
	//	logger.Errorf("git clone error: %v", err)
	//	return nil, err
	//}
	//logger.Info("git clone success")
	//
	stack["workdir"] = a.workdir
	return nil, nil
}

func (a *GitAction) Post() error {
	//return os.Remove(a.workdir)
	return nil
}

func (a *GitAction) ExecuteStringCommand(command string) (string, error) {
	commands := strings.Fields(command)
	return a.ExecuteCommand(commands)
}

func (a *GitAction) ExecuteCommand(commands []string) (string, error) {

	c := exec.CommandContext(a.ctx, commands[0], commands[1:]...) // mac linux
	c.Dir = a.workdir
	logger.Debugf("execute git clone command: %s", strings.Join(commands, " "))
	a.output.WriteCommandLine(strings.Join(commands, " "))

	out, err := c.CombinedOutput()

	a.output.WriteCommandLine(string(out))
	if err != nil {
		a.output.WriteLine(err.Error())
	}
	return string(out), err

}

func containsBranch(branchOutput, branch string) bool {
	array := strings.Split(branchOutput, "\n")

	for _, s := range array {
		if len(strings.Fields(s)) == 0 {
			continue
		}
		if strings.EqualFold(strings.Fields(s)[0], branch) {
			return true
		}
	}
	return false
}
