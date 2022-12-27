package main

import (
	"cess_api/controller"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	loadEnv()
	loadDatabase()
	serveApplication()
}

func loadEnv() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func loadDatabase() {
	// database.Connect()
	// database.Database.AutoMigrate(&model.User{})
	// database.Database.AutoMigrate(&model.Entry{})
}

func serveApplication() {
	router := gin.Default()

	apiRoutes := router.Group("/api")

	apiRoutes.POST("/storage/auth", controller.Auth)
	apiRoutes.POST("/storage/bucket/:name", controller.CreateBucket)
	apiRoutes.POST("/storage/:filename", controller.Upload)
	apiRoutes.GET("/storage/:fid", controller.Download)
	apiRoutes.GET("/storage/raw/:fid", controller.DownloadRaw)

	router.Run(":8887")
	fmt.Println("Server running on port 8887")
}
