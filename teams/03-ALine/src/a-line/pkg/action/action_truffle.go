package action

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/output"
)

//go:embed deploy_config/truffle-config.js
var TruffleConfigFile []byte

//go:embed deploy_config/truffle-config-local.js
var TruffleConfigLocal []byte

// TruffleDeployAction truffle deploy action
type TruffleDeployAction struct {
	network    string // deploy network
	privateKey string // deploy Private key
	output     *output.Output
	ctx        context.Context
}

func NewTruffleDeployAction(step model.Step, ctx context.Context, output *output.Output) *TruffleDeployAction {
	return &TruffleDeployAction{
		network:    step.With["network"],
		privateKey: step.With["private-key"],
		ctx:        ctx,
		output:     output,
	}
}

func (a *TruffleDeployAction) Pre() error {
	stack := a.ctx.Value(STACK).(map[string]interface{})
	workdir := stack["workdir"].(string)
	_, err := os.Stat(workdir)
	if os.IsNotExist(err) {
		return errors.New("workdir not exist")
	}
	truffleConfigPath := filepath.Join(workdir, "truffle-config.js")
	if a.network != "default" {
		if a.privateKey == "" {
			return errors.New("private key is empty")
		}
		//private key path
		keyPath := filepath.Join(workdir, "key.secret")
		err = os.WriteFile(keyPath, []byte(a.privateKey), 0777)
		if err != nil {
			return errors.New("failed to write private key to file")
		}
		err = os.WriteFile(truffleConfigPath, TruffleConfigFile, 0777)
		if err != nil {
			return errors.New("failed to replace truffle-config. js")
		}
	} else {
		err = os.WriteFile(truffleConfigPath, TruffleConfigLocal, 0777)
		if err != nil {
			return errors.New("failed to replace truffle-config. js")
		}
	}
	return nil
}

func (a *TruffleDeployAction) Hook() (*model.ActionResult, error) {
	stack := a.ctx.Value(STACK).(map[string]interface{})
	logger.Infof("git stack: %v", stack)
	workdir, ok := stack["workdir"].(string)
	if !ok {
		return nil, errors.New("get workdir error")
	}
	command := "truffle deploy"
	if a.network != "default" {
		command = fmt.Sprintf("truffle migrate --reset --network  %s", a.network)
	}
	out, err := a.ExecuteStringCommand(command, workdir)
	a.output.WriteLine(out)
	if err != nil {
		return nil, err
	}
	return nil, nil
}

func (a *TruffleDeployAction) Post() error {
	//return os.Remove(a.workdir)
	return nil
}

func (a *TruffleDeployAction) ExecuteStringCommand(command, workdir string) (string, error) {
	commands := strings.Fields(command)
	return a.ExecuteCommand(commands, workdir)
}

func (a *TruffleDeployAction) ExecuteCommand(commands []string, workdir string) (string, error) {
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
