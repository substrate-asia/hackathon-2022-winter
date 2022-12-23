package serv

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"polk-p2/define"
	"tools/ihelp"
	"tools/ilog"
)

type HttpServer struct {
	middleware Middleware
	router     Router
}

func (t *HttpServer) Server() {
	defer ihelp.ErrCatch()

	fmt.Printf("http server start listen on %s\n", define.HttpAddr)

	gin.SetMode(gin.ReleaseMode)
	//gin.SetMode(gin.DebugMode)
	router := gin.New()
	//router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(t.middleware.proxy())
	t.router.setRouter(router)
	if err := router.Run(define.HttpAddr); err != nil {
		ilog.Logger.Error(err)
		return
	}
}
