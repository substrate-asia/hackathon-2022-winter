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
	"io"
	"mime/multipart"
	"net/http"
	"os"
	path2 "path"
	"path/filepath"
)

// PinataIpfsAction Upload files/directories to ipfs
type PinataIpfsAction struct {
	path   string
	output *output.Output
	ctx    context.Context
}

func NewPinataIpfsAction(step model.Step, ctx context.Context, output *output.Output) *PinataIpfsAction {
	return &PinataIpfsAction{
		path:   step.With["path"],
		ctx:    ctx,
		output: output,
	}
}

func (a *PinataIpfsAction) Pre() error {
	return nil
}

func (a *PinataIpfsAction) Hook() (*model.ActionResult, error) {

	stack := a.ctx.Value(STACK).(map[string]interface{})

	workdir, ok := stack["workdir"].(string)
	if !ok {
		return nil, errors.New("get workdir error")
	}

	path := path2.Join(workdir, a.path)
	fi, err := os.Stat(path)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("get path fail, err is  %s", err.Error()))
	}
	isDir := fi.IsDir()
	var dstPath string
	if isDir {
		dstPath = path
	} else {
		dstPath = path
	}
	_, fileName := path2.Split(dstPath)
	pinataMetadataFmt := consts.PinataMetadataFmt
	pinataMetadata := fmt.Sprintf(pinataMetadataFmt, fileName)
	payload := &bytes.Buffer{}
	writer := multipart.NewWriter(payload)
	file, err := os.Open(dstPath)
	if err != nil {
		return nil, errors.New("open path fail")
	}
	defer file.Close()
	part1, err := writer.CreateFormFile("file", filepath.Base(dstPath))
	if err != nil {
		return nil, errors.New("create FormFile fail")
	}
	_, err = io.Copy(part1, file)
	if err != nil {
		return nil, errors.New("file copy fail")
	}

	_ = writer.WriteField("pinataOptions", consts.PinataOptionsFmt)
	_ = writer.WriteField("pinataMetadata", pinataMetadata)
	err = writer.Close()
	if err != nil {
		return nil, errors.New("writer close fail")
	}

	client := &http.Client{}
	req, err := http.NewRequest("POST", consts.PinataIpfsPinUrl, payload)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", "Bearer "+consts.PinataIpfsJWT)

	req.Header.Set("Content-Type", writer.FormDataContentType())
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	var pinataIpfsPinReq PinataIpfsPinReq
	err = json.Unmarshal(body, &pinataIpfsPinReq)
	if err != nil {
		return nil, errors.New("req json unmarshal fail")
	}

	actionResult := model.ActionResult{
		Artifactorys: []model.Artifactory{
			{
				Name: a.path,
				Url:  consts.PinataIpfsUrl + pinataIpfsPinReq.IpfsHash,
			},
		},
		Reports: nil,
	}
	fmt.Println(actionResult)
	return &actionResult, nil
}

func (a *PinataIpfsAction) Post() error {
	return nil
}

type PinataIpfsPinReq struct {
	IpfsHash  string `json:"IpfsHash"`  //This is the IPFS multi-hash provided back for your content
	PinSize   string `json:"PinSize"`   //This is how large (in bytes) the content you just pinned is
	Timestamp string `json:"timestamp"` //This is the timestamp for your content pinning (represented in ISO 8601 format)
}
