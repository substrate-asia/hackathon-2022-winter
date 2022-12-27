package main

import (
	"flag"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"qv.od/internal"
	"qv.od/internal/app_storage"
)

func main() {
	// Parse cli configuration
	var config internal.ApiServerConfig
	flag.StringVar(&config.ListenAddr, "listen-addr", ":8080", "Listen address for API server")
	flag.StringVar(&config.TempDataDir, "tmp-dir", "/tmp", "Temporary directory for file uploading and processing")
	cessRpcUrl := flag.String("rpc-url", "wss://testnet-rpc0.cess.cloud/ws/", "RPC URL of CESS network")
	flag.Parse()

	// Start HTTP server
	srv := fiber.New(
		fiber.Config{
			BodyLimit: 100 * 1024 * 1024, // 100MB
		},
	)

	srv.Use(cors.New())
	srv.Use(requestid.New())
	srv.Use(logger.New(logger.Config{
		Format: "$[${ip}]:${port} {pid} ${locals:requestid} ${status} - ${method} ${path}\n",
	}))

	// Save configuration to local data
	srv.Use(func(ctx *fiber.Ctx) error {
		ctx.Locals(internal.AppConfigKey, config)
		ctx.Locals(internal.CessRpcUrlKey, *cessRpcUrl)
		return ctx.Next()
	})

	app_storage.Init()

	// Prepare Storage API, for now only CESS rpc client
	// Say friend and enter
	srv.Post("/mellon", internal.InitHandler)

	// index handler returns required information of self index page
	srv.Get("/index", internal.IndexHandler)

	// create site
	srv.Post("/site", internal.NewSiteHandler)
	// subscribe site
	srv.Post("/subscribe_site", internal.SubscribeSiteHandle)

	// View media file, this is for the entry request
	srv.Get("/media/:user_key/:entry_fid", internal.ViewMediaHandler)
	srv.Get("/mediasegs/:user_key/:fid", internal.ViewMediaSegHandler)

	// Upload file to bucket
	// besides binary file data, additional metadata should also be provided based on file type
	srv.Post("/upload", internal.UploadFileHandler)

	// list all medias of site
	srv.Get("/site_medias/:site_id", internal.SiteMediaListHandler)

	// List all files uploaded by specified account id
	srv.Get("/files/:accountId", internal.ListAllFilesForAccountHandler)

	log.Fatal(srv.Listen(config.ListenAddr))
}
