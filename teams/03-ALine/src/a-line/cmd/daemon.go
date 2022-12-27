/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"github.com/hamster-shared/a-line/pkg/controller"
	"github.com/hamster-shared/a-line/pkg/dispatcher"
	"github.com/hamster-shared/a-line/pkg/executor"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/spf13/cobra"
)

// daemonCmd represents the daemon command
var daemonCmd = &cobra.Command{
	Use:   "daemon",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("daemon called")
		dispatch := dispatcher.NewDispatcher(channel)
		// 本地注册
		dispatch.Register(&model.Node{
			Name:    "localhost",
			Address: "127.0.0.1",
		})

		executeClient := executor.NewExecutorClient(channel, jobService)
		defer close(channel)

		go executeClient.Main()

		port, _ = rootCmd.PersistentFlags().GetInt("port")
		go controller.OpenWeb(port)
		controller.NewHttpService(*handlerServer, port).StartHttpServer()

	},
}

func init() {
	rootCmd.AddCommand(daemonCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// daemonCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// daemonCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
