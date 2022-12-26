package helper

import (
	"encoding/json"
	"fmt"
	"os"
)

type AuthInfo struct {
	Account   string   `json:"account"`
	Message   string   `json:"message"`
	Signature [64]byte `json:"signature"`
}

type TokenInfo struct {
	Token string `json:"token"`
}

//return AuthToken
func Auth(account string, message string, signature [64]byte) (string, error) {
	fmt.Println("##in helper Auth")

	authInfo := AuthInfo{account, message, signature}
	b, err := json.Marshal(authInfo)
	if err != nil {
		fmt.Println("@@@Auth in helper Auth, json.Marshal fail")
		return "", err
	}

	ossHost := os.Getenv("OSS_HOST")

	url := ossHost + "auth"
	headers := make(map[string]string)
	headers["Content-Type"] = "application/json;charset=utf-8"

	res, err := PostWithHeader(url, b, headers)
	if err != nil {
		fmt.Println("@@@Auth in helper Auth,PostWithHeader fail", err.Error(), res)
		return string(res), err
	}

	var tokenInfo TokenInfo

	err = json.Unmarshal(res, &tokenInfo)
	if err != nil {
		fmt.Println("@@@Auth in helper Auth,PostWithHeader fail", err.Error(), res)
		return string(res), err
	}

	return tokenInfo.Token, nil
}

//return Block hash
func CreateBucket(authToken string, bucketName string) (string, error) {
	ossHost := os.Getenv("OSS_HOST")
	url := ossHost + bucketName
	headers := make(map[string]string)
	headers["Authorization"] = authToken

	fmt.Println("@@@CreateBucket in helper", url, headers)

	res, err := PutWithHeader(url, nil, headers)

	if err != nil {
		return string(res), err
	}

	return string(res), nil
}

// return file id
func Upload(authToken string, bucketName string, fileName string, content []byte) (string, error) {
	ossHost := os.Getenv("OSS_HOST")
	url := ossHost + fileName
	headers := make(map[string]string)
	headers["Authorization"] = authToken
	headers["BucketName"] = bucketName
	headers["Content-Type"] = "application/octet-stream"

	fmt.Println("@@@Upload in helper", url, headers)
	res, err := PutWithHeaderAndForm(url, content, headers, fileName)

	if err != nil {
		return string(res), err
	}

	return string(res), nil
}

//file	file[binary]
func Download(account string, fid string) ([]byte, error) {
	ossHost := os.Getenv("OSS_HOST")
	url := ossHost + fid
	headers := make(map[string]string)
	headers["Account"] = account
	headers["Operation"] = "download"
	res, err := GetWithHeader(url, headers)

	if err != nil {
		return res, err
	}

	return res, nil
}
