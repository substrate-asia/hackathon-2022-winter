package icurl

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"mime/multipart"
	"net/http"
)

// Get
// @description "http get请求"
// @param url "请求链接"
// @param header "头信息"
// @return string "返回数据"
func Get(url string, header *map[string]string) ([]byte, error) {
	var res []byte
	var req *http.Request
	var rsp *http.Response
	var err error
	req, err = http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	if header != nil {
		for k, v := range *header {
			req.Header.Add(k, v)
		}
	}
	c := &http.Client{}
	rsp, err = c.Do(req)
	if err != nil {
		return nil, err
	}
	defer rsp.Body.Close()

	if rsp.StatusCode != 200 {
		return nil, errors.New(fmt.Sprintf("status code is %d", rsp.StatusCode))
	}

	res, err = ioutil.ReadAll(rsp.Body)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// PostForm post form提交
func PostForm(url string, header, data *map[string]string) ([]byte, error) {
	body := new(bytes.Buffer)
	w := multipart.NewWriter(body)
	for k, v := range *data {
		_ = w.WriteField(k, v)
	}
	_ = w.Close()
	req, _ := http.NewRequest("POST", url, body)
	req.Header.Add("Content-Type", w.FormDataContentType())
	if header != nil {
		for k, v := range *header {
			req.Header.Set(k, v)
		}
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 201 && resp.StatusCode != 204 {
		return nil, errors.New(fmt.Sprintf("status code is %d", resp.StatusCode))
	}

	respData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return respData, nil
}

// PostJSON JSON提交
func PostJSON(url string, header *map[string]string, data interface{}) ([]byte, error) {
	jec, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	body := new(bytes.Buffer)
	body.Write(jec)
	req, _ := http.NewRequest("POST", url, body)
	req.Header.Add("Content-Type", "application/json; charset=utf-8")
	if header != nil {
		for k, v := range *header {
			req.Header.Set(k, v)
		}
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 201 && resp.StatusCode != 204 {
		return nil, errors.New(fmt.Sprintf("status code is %d", resp.StatusCode))
	}

	result, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return result, nil
}

// PostForm post form提交
func PostFormV1(url string, header, data *map[string]string) ([]byte, int, error) {
	body := new(bytes.Buffer)
	w := multipart.NewWriter(body)
	for k, v := range *data {
		_ = w.WriteField(k, v)
	}
	_ = w.Close()
	req, _ := http.NewRequest("POST", url, body)
	req.Header.Add("Content-Type", w.FormDataContentType())
	if header != nil {
		for k, v := range *header {
			req.Header.Set(k, v)
		}
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, resp.StatusCode, err
	}
	defer resp.Body.Close()

	//if resp.StatusCode != 200 && resp.StatusCode != 201 && resp.StatusCode != 204 {
	//	return nil, errors.New(fmt.Sprintf("status code is %d", resp.StatusCode))
	//}

	respData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}
	return respData, resp.StatusCode, nil
}
