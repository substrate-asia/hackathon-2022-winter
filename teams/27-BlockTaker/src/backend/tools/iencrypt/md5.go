package iencrypt

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"os"
)

// Md5 md5加密
// use16=true 返回16位md5值
func Md5(data string) string {
	h := md5.New()
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

// Md5Sum 校验文件md5sum
func Md5Sum(filePath string) string {
	// 文件全路径名
	pFile, err := os.Open(filePath)
	if err != nil {
		return "打不开文件" + filePath
	}
	defer pFile.Close()
	md5h := md5.New()
	_, _ = io.Copy(md5h, pFile)
	return hex.EncodeToString(md5h.Sum(nil))
}
