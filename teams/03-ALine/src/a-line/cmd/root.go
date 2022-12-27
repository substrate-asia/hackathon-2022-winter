/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"github.com/hamster-shared/a-line/pkg/controller"
	"github.com/hamster-shared/a-line/pkg/dispatcher"
	"github.com/hamster-shared/a-line/pkg/executor"
	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/pipeline"
	"github.com/hamster-shared/a-line/pkg/service"
	"os"
	"path"

	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var (
	port            = 8080
	channel         = make(chan model.QueueMessage)
	dispatch        = dispatcher.NewDispatcher(channel)
	pipelineFile    string
	jobService      = service.NewJobService()
	templateService = service.NewTemplateService()
	handlerServer   = controller.NewHandlerServer(jobService, dispatch, templateService)
	rootCmd         = &cobra.Command{
		Use:   "a-line-cli",
		Short: "A brief description of your application",
		Long: `A longer description that spans multiple lines and likely contains
examples and usage of using your application. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
		// Uncomment the following line if your bare application
		// has an action associated with it:
		Run: func(cmd *cobra.Command, args []string) {
			//wd, _ := os.Getwd()
			cicdFile, err := os.Open(path.Join(pipelineFile))
			if err != nil {
				fmt.Println("file error")
				return
			}

			// 启动executor

			executeClient := executor.NewExecutorClient(channel, jobService)
			defer close(channel)

			job, _ := pipeline.GetJobFromReader(cicdFile)
			jobService.SaveJobWithFile(pipelineFile, job.Name)
			Stages, _ := job.StageSort()
			jobDetail := &model.JobDetail{
				Id:     1,
				Job:    *job,
				Status: model.STATUS_NOTRUN,
				Stages: Stages,
			}
			jobService.SaveJobDetail(job.Name, jobDetail)

			err = executeClient.Execute(1, job)
			if err != nil {
				logger.Error("err:", err)
			}

		},
	}
)

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	// rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.a-line-cli.yaml)")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	rootCmd.Flags().StringVar(&pipelineFile, "file", "cicd.yml", "pipeline file")

	rootCmd.PersistentFlags().IntP("port", "p", 8080, "http port")
}
