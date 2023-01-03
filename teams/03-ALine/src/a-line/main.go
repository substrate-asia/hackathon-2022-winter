package main

import (
	"github.com/hamster-shared/a-line/cmd"
	"github.com/hamster-shared/a-line/pkg/logger"

	"github.com/sirupsen/logrus"
)

func main() {
	logger.Init().ToStdoutAndFile().SetLevel(logrus.TraceLevel)
	cmd.Execute()
}
