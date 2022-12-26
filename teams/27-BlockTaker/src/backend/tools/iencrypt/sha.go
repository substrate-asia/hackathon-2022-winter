package iencrypt

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"io"
	"os"
)

// Sha1 加密
func Sha1(src []byte) string {
	h := sha1.New()
	h.Write(src)
	return hex.EncodeToString(h.Sum(nil))
}

func Sha256(src []byte) string {
	h := sha256.New()
	h.Write(src)
	return hex.EncodeToString(h.Sum(nil))
}

func Sha512(src []byte) string {
	h := sha512.New()
	h.Write(src)
	return hex.EncodeToString(h.Sum(nil))
}

func Sha1File(path string) (string, error) {
	file, err := os.Open(path)
	defer file.Close()
	if err != nil {
		return "", err
	}

	h := sha1.New()
	_, err = io.Copy(h, file)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(h.Sum(nil)), nil
}
