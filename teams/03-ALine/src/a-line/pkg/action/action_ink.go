package action

import (
	"context"
	"errors"
	"github.com/hamster-shared/a-line/pkg/consts"
	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/output"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type InkAction struct {
	network  string // deploy network
	mnemonic string // deploy Private key
	output   *output.Output
	ctx      context.Context
}

func NewInkAction(step model.Step, ctx context.Context, output *output.Output) *InkAction {
	return &InkAction{
		network:  step.With["network"],
		mnemonic: step.With["mnemonic"],
		ctx:      ctx,
		output:   output,
	}
}

func (a *InkAction) Pre() error {
	stack := a.ctx.Value(STACK).(map[string]interface{})
	logger.Infof("git stack: %v", stack)
	workdir, ok := stack["workdir"].(string)
	if !ok {
		return errors.New("get workdir error")
	}
	command := "npm install -g deploy-polkadot@1.0.3"
	out, err := a.ExecuteStringCommand(command, workdir)
	a.output.WriteLine(out)
	if err != nil {
		return err
	}
	return nil
}

func (a *InkAction) Hook() (*model.ActionResult, error) {
	stack := a.ctx.Value(STACK).(map[string]interface{})
	logger.Infof("git stack: %v", stack)
	workdir, ok := stack["workdir"].(string)
	if !ok {
		return nil, errors.New("get workdir error")
	}
	targetPath := filepath.Join(workdir, "target", "ink")
	_, err := os.Stat(targetPath)
	if os.IsNotExist(err) {
		log.Println("get target directory failed", err.Error())
		return nil, err
	}
	files, err := os.ReadDir(targetPath)
	if err != nil {
		log.Println("read target file failed: ", err.Error())
		return nil, err
	}
	var fileName string
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".contract") {
			fileName = file.Name()
			break
		}
	}
	//var command string
	if fileName != "" {
		contractPath := filepath.Join(targetPath, fileName)
		commands := []string{"deploy-polkadot", "--url", consts.InkUrlMap[a.network], "--mnemonic", a.mnemonic, "--metadata", contractPath}
		out, err := a.ExecuteCommand(commands, workdir)
		a.output.WriteLine(out)
		if err != nil {
			return nil, err
		}
		return nil, nil
	}
	return nil, errors.New("no contract structures found")
}

func (a *InkAction) Post() error {
	//return os.Remove(a.workdir)
	return nil
}

func (a *InkAction) ExecuteStringCommand(command, workdir string) (string, error) {
	commands := strings.Fields(command)
	return a.ExecuteCommand(commands, workdir)
}

func (a *InkAction) ExecuteCommand(commands []string, workdir string) (string, error) {
	c := exec.CommandContext(a.ctx, commands[0], commands[1:]...) // mac linux
	c.Dir = workdir
	logger.Debugf("execute truffle deploy command: %s", strings.Join(commands, " "))
	a.output.WriteCommandLine(strings.Join(commands, " "))

	out, err := c.CombinedOutput()

	a.output.WriteCommandLine(string(out))
	if err != nil {
		a.output.WriteLine(err.Error())
	}
	return string(out), err
}
