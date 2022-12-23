package main

import (
	"os"
	"os/signal"
	"polk-p2/cronjob"
	"polk-p2/internal/serv"
	"polk-p2/internal/utils"
	"syscall"
	"tools/ilog"
	"tools/resp"
)

func main() {
	ilog.Init(false, "")
	resp.Debug = true

	new(utils.Database).NewDb()

	go new(serv.HttpServer).Server()
	go new(cronjob.Cron).CronFunc()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
}
