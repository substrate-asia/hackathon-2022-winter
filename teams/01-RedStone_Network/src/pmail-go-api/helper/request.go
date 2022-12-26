package helper

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
)

func PostWithHeader(url string, msg []byte, headers map[string]string) ([]byte, error) {
	client := &http.Client{}

	req, err := http.NewRequest(http.MethodPost, url, strings.NewReader(string(msg)))
	if err != nil {
		return nil, err
	}
	for key, header := range headers {
		req.Header.Set(key, header)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return body, errors.New("error:" + strconv.Itoa(resp.StatusCode) + ", " + string(body))
	}

	return body, nil
}

func PutWithHeader(url string, msg []byte, headers map[string]string) ([]byte, error) {
	client := &http.Client{}

	req, err := http.NewRequest(http.MethodPut, url, strings.NewReader(string(msg)))
	if err != nil {
		return nil, err
	}
	for key, header := range headers {
		req.Header.Set(key, header)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	fmt.Println("@@@@put resp body", body, string(body))

	if resp.StatusCode != 200 {
		return body, errors.New("error:" + strconv.Itoa(resp.StatusCode) + ", " + string(body))
	}

	return body, nil
}

func PutWithHeaderAndForm(url string, msg []byte, headers map[string]string, filename string) ([]byte, error) {
	client := &http.Client{}

	fileDir := os.TempDir()
	filePath := path.Join(fileDir, filename)

	err := ioutil.WriteFile(filePath, msg, 0666)
	if err != nil {
		return nil, err
	}
	defer os.Remove(filePath)

	payload := &bytes.Buffer{}             // 初始化body参数
	writer := multipart.NewWriter(payload) // 实例化multipart

	part, err := writer.CreateFormFile("file", filepath.Base(filename)) // 创建multipart 文件字段
	if err != nil {
		return nil, err
	}
	_, err = io.Copy(part, bytes.NewReader(msg)) // 写入文件数据到multipart
	if err != nil {
		return nil, err
	}

	_ = writer.WriteField("type", "application/octet-stream")

	err = writer.Close()
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPut, url, payload)
	if err != nil {
		return nil, err
	}
	for key, header := range headers {
		req.Header.Set(key, header)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	fmt.Println("@@@@put resp body", body, string(body))

	if resp.StatusCode != 200 {
		return body, errors.New("error:" + strconv.Itoa(resp.StatusCode) + ", " + string(body))
	}

	return body, nil
}

func GetWithHeader(url string, headers map[string]string) ([]byte, error) {
	client := &http.Client{}

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	for key, header := range headers {
		req.Header.Set(key, header)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return body, errors.New("error:" + strconv.Itoa(resp.StatusCode) + ", " + string(body))
	}

	return body, nil
}
