package action

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hamster-shared/a-line/pkg/consts"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/output"
	"github.com/hamster-shared/a-line/pkg/utils"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	path2 "path"
)

// IpfsAction Upload files/directories to ipfs
type IpfsAction struct {
	path   string
	output *output.Output
	ctx    context.Context
}

func NewIpfsAction(step model.Step, ctx context.Context, output *output.Output) *IpfsAction {
	return &IpfsAction{
		path:   step.With["path"],
		ctx:    ctx,
		output: output,
	}
}

func (a *IpfsAction) Pre() error {
	return nil
}

func (a *IpfsAction) Hook() (*model.ActionResult, error) {

	stack := a.ctx.Value(STACK).(map[string]interface{})

	workdir, ok := stack["workdir"].(string)
	if !ok {
		return nil, errors.New("get workdir error")
	}

	path := path2.Join(workdir, a.path)
	fmt.Println(path)
	fi, err := os.Stat(path)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("get path fail, err is  %s", err.Error()))
	}
	isDir := fi.IsDir()
	var dstPath string
	if isDir {
		dstPath = path + ".car"
		_, err := os.Stat(dstPath)
		if err == nil {
			os.Remove(dstPath)
		}
		car, err := utils.CreateCar(a.ctx, path, dstPath, consts.CarVersion)
		if err != nil {
			return nil, errors.New("dir to car fail")
		}
		fmt.Println(fmt.Sprintf("%s 的ipfs hash 是 %s", path, car))
	} else {
		dstPath = path
	}

	_, file := path2.Split(dstPath)
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	formFile, err := writer.CreateFormFile("file", file)
	if err != nil {
		return nil, err
	}
	open, err := os.Open(dstPath)
	if err != nil {
		return nil, errors.New("dstPath open fail")
	}
	_, err = io.Copy(formFile, open)
	if err != nil {
		return nil, err
	}
	err = writer.Close()
	if err != nil {
		return nil, err
	}
	client := http.Client{}
	req, err := http.NewRequest("POST", consts.IpfsUploadUrl, body)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", writer.FormDataContentType())
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	bodyText, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	fmt.Printf("收到的req是  %s\n", bodyText)
	var ipfsGatewayCloudReq IpfsGatewayCloudReq
	err = json.Unmarshal(bodyText, &ipfsGatewayCloudReq)
	if err != nil {
		return nil, errors.New("req json unmarshal fail")
	}
	actionResult := model.ActionResult{
		Artifactorys: []model.Artifactory{
			{
				Name: a.path,
				Url:  ipfsGatewayCloudReq.Url,
			},
		},
		Reports: nil,
	}
	fmt.Println(actionResult)
	return &actionResult, nil
}

func (a *IpfsAction) Post() error {
	return nil
}

type IpfsGatewayCloudReq struct {
	UploadID       string `json:"uploadID"`
	UploadFileType string `json:"upload_file_type"`
	UploadType     string `json:"upload_type"`
	Cid            string `json:"cid"`
	Filename       string `json:"filename"`
	ContentType    string `json:"content_type"`
	Size           int    `json:"size"`
	Url            string `json:"url"`
	Status         string `json:"status"`
	Pin            string `json:"pin"`
	Dht            string `json:"dht"`
}
