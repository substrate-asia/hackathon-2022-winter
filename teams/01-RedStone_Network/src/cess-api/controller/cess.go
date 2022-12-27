package controller

import (
	"cess_api/helper"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"log"

	"github.com/gin-gonic/gin"
)

// auth the oss serve
func Auth(context *gin.Context) {
	fmt.Println("@@@Auth info!")

	account := os.Getenv("CESS_ADDRESS")
	mnemonic := os.Getenv("MNEMONIC")
	message := "123456"
	sig, err := helper.GetSign(mnemonic, message)
	if err != nil {
		fmt.Println("Auth error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "GetSign fail! because " + err.Error()})
		return
	} else {
		fmt.Println("GetSign success! ")
	}
	token, err := helper.Auth(account, message, sig)
	if err != nil {
		fmt.Println("Auth error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "Auth fail! because " + err.Error()})
		return
	} else {
		fmt.Println("Auth success! " + token)
	}

	context.JSON(http.StatusOK, gin.H{"data": token, "code": 0, "msg": "ok"})
}

// create file bucket
func CreateBucket(context *gin.Context) {
	log.Println("##in CreateBucket")
	name := context.Param("name")

	account := os.Getenv("CESS_ADDRESS")
	mnemonic := os.Getenv("MNEMONIC")
	message := "123456"
	sig, err := helper.GetSign(mnemonic, message)
	if err != nil {
		fmt.Println("Auth error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "GetSign fail! because " + err.Error()})
		return
	} else {
		fmt.Println("GetSign success! ")
	}
	token, err := helper.Auth(account, message, sig)
	if err != nil {
		fmt.Println("Auth error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "Auth fail! because " + err.Error()})
		return
	} else {
		fmt.Println("Auth success! " + token)
	}

	hash, err := helper.CreateBucket(token, name)
	if err != nil {
		fmt.Println("CreateBucket error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "Auth fail! because " + err.Error()})
		return
	} else {
		fmt.Println("CreateBucket success! " + hash)
	}

	context.JSON(http.StatusOK, gin.H{"data": hash, "code": 0, "msg": "ok"})
}

// upload file
func Upload(context *gin.Context) {
	log.Println("##in Upload")
	filename := context.Param("filename")
	fmt.Println("Upload filename! " + filename)

	defaultBucket := os.Getenv("DEFAULT_BUCKET")

	account := os.Getenv("CESS_ADDRESS")
	mnemonic := os.Getenv("MNEMONIC")
	message := "123456"
	sig, err := helper.GetSign(mnemonic, message)
	if err != nil {
		fmt.Println("Auth error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "GetSign fail! because " + err.Error()})
		return
	} else {
		fmt.Println("GetSign success! ")
	}
	token, err := helper.Auth(account, message, sig)
	if err != nil {
		fmt.Println("Auth error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "Auth fail! because " + err.Error()})
		return
	} else {
		fmt.Println("Auth success! " + token)
	}

	d, err := ioutil.ReadAll(context.Request.Body)
	if err != nil {
		fmt.Println("Upload read body error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "read body fail! because " + err.Error()})
		return
	}

	fid, err := helper.Upload(token, defaultBucket, filename, d)
	fid, _ = strconv.Unquote(fid)
	if err != nil {
		fmt.Println("Upload error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "Upload fail! because " + err.Error()})
		return
	} else {
		fmt.Println("Upload success! " + fid)
	}

	context.JSON(http.StatusOK, gin.H{"data": fid, "code": 0, "msg": "ok"})
}

// download file content with the json format
func Download(context *gin.Context) {
	log.Println("##in Download")
	fid := context.Param("fid")
	fmt.Println("Download fid! " + fid)

	//defaultBucket := os.Getenv("DEFAULT_BUCKET")
	account := os.Getenv("CESS_ADDRESS")

	rt, err := helper.Download(account, fid)
	if err != nil {
		fmt.Println("Download error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "Download fail! because " + err.Error()})
		return
	} else {
		fmt.Println("Download success! ")
	}

	context.JSON(http.StatusOK, gin.H{"data": string(rt), "code": 0, "msg": "ok"})
}

// download the raw file
func DownloadRaw(context *gin.Context) {
	log.Println("##in Download")
	fid := context.Param("fid")
	fmt.Println("Download fid! " + fid)

	//defaultBucket := os.Getenv("DEFAULT_BUCKET")
	account := os.Getenv("CESS_ADDRESS")

	rt, err := helper.Download(account, fid)
	if err != nil {
		fmt.Println("Download error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": nil, "code": 1, "msg": "Download fail! because " + err.Error()})
		return
	} else {
		fmt.Println("Download success! ")
	}

	context.Data(http.StatusOK, "application/octet-stream", rt)
}
