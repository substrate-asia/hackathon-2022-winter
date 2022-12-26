package iencrypt

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"io/ioutil"
	"os"
)

type Rsa struct {
	privateKey    string
	publicKey     string
	rsaPrivateKey *rsa.PrivateKey
	rsaPublicKey  *rsa.PublicKey
}

func New() *Rsa {
	return &Rsa{}
}

//--- Public Function

func (c *Rsa) GenRSAKey(size int) *Rsa {
	// size can use 1024
	privateKey, err := rsa.GenerateKey(rand.Reader, size)
	if err != nil {
		return nil
	}
	c.rsaPrivateKey = privateKey
	c.rsaPublicKey = &privateKey.PublicKey
	return c
}

func (c *Rsa) LoadFromKeyFiles(priKeyPath, pubKeyPath string) (*Rsa, error) {
	var err error
	c.rsaPrivateKey, err = loadPrivateKeyFile(priKeyPath)
	if err != nil {
		return nil, err
	}
	c.rsaPublicKey, err = loadPublicKeyFile(pubKeyPath)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (c *Rsa) LoadFromBase64(priKey, pubKey string) (*Rsa, error) {
	var err error
	c.rsaPrivateKey, err = loadPrivateKeyBase64(priKey)
	if err != nil {
		return nil, err
	}
	c.rsaPublicKey, err = loadPublicKeyBase64(pubKey)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (c *Rsa) LoadFromPrivateKeyFile(priKeyPath string) (*Rsa, error) {
	var err error
	c.rsaPrivateKey, err = loadPrivateKeyFile(priKeyPath)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (c *Rsa) LoadFromPublicKeyFile(pubKeyPath string) (*Rsa, error) {
	var err error
	c.rsaPublicKey, err = loadPublicKeyFile(pubKeyPath)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (c *Rsa) LoadFromPrivateKeyBase64(base64key string) (*Rsa, error) {
	var err error
	c.rsaPrivateKey, err = loadPrivateKeyBase64(base64key)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func (c *Rsa) LoadPublicKeyBase64(base64key string) (*Rsa, error) {
	var err error
	c.rsaPublicKey, err = loadPublicKeyBase64(base64key)
	if err != nil {
		return nil, err
	}
	return c, nil
}

//---

func (c *Rsa) Encrypt(src []byte) (bytes []byte, err error) {
	return rsa.EncryptPKCS1v15(rand.Reader, c.rsaPublicKey, src)
}

func (c *Rsa) EncryptBlock(src []byte) (bytesEncrypt []byte, err error) {
	keySize, srcSize := c.rsaPublicKey.Size(), len(src)
	offSet, once := 0, keySize-11
	buffer := bytes.Buffer{}
	for offSet < srcSize {
		endIndex := offSet + once
		if endIndex > srcSize {
			endIndex = srcSize
		}
		bytesOnce, err := c.Encrypt(src[offSet:endIndex])
		if err != nil {
			return nil, err
		}
		buffer.Write(bytesOnce)
		offSet = endIndex
	}
	bytesEncrypt = buffer.Bytes()
	return
}

func (c *Rsa) EncryptBlockByString(src string) (bytesDecrypt []byte, err error) {
	data, err := c.Encrypt([]byte(src))
	if err != nil {
		return nil, err
	}
	bytesDecrypt = []byte(base64.StdEncoding.EncodeToString(data))
	return
}

func (c *Rsa) Decrypt(src []byte) (bytes []byte, err error) {
	return rsa.DecryptPKCS1v15(rand.Reader, c.rsaPrivateKey, src)
}

func (c *Rsa) DecryptBlock(src []byte) (bytesDecrypt []byte, err error) {
	keySize, srcSize := c.rsaPrivateKey.Size(), len(src)
	var offSet = 0
	var buffer = bytes.Buffer{}
	for offSet < srcSize {
		endIndex := offSet + keySize
		if endIndex > srcSize {
			endIndex = srcSize
		}
		bytesOnce, err := c.Decrypt(src[offSet:endIndex])
		if err != nil {
			return nil, err
		}
		buffer.Write(bytesOnce)
		offSet = endIndex
	}
	bytesDecrypt = buffer.Bytes()
	return
}

func (c *Rsa) DecryptBlockByString(src []string) (bytesDecrypt []byte, err error) {
	var t []byte
	for _, content := range src {
		cipherText, _ := base64.StdEncoding.DecodeString(content)
		t = append(t, cipherText...)
	}
	bytesDecrypt, err = c.DecryptBlock(t)
	return
}

//--- Export ---

func (c *Rsa) KeysToBytes() (publicKeyBytes, privateKeyBytes []byte) {
	return c.PublicKeyToBytes(), c.PrivateKeyToBytes()
}

func (c *Rsa) PrivateKeyToBytes() (privateKeyBytes []byte) {
	return x509.MarshalPKCS1PrivateKey(c.rsaPrivateKey)
}

func (c *Rsa) PublicKeyToBytes() (publicKeyBytes []byte) {
	return x509.MarshalPKCS1PublicKey(c.rsaPublicKey)
}

func (c *Rsa) DumpPublicKeyFile(filename string) error {
	keyBytes, err := x509.MarshalPKIXPublicKey(c.rsaPublicKey)
	if err != nil {
		return err
	}
	block := &pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: keyBytes,
	}
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	err = pem.Encode(file, block)
	if err != nil {
		return err
	}
	return nil
}

func (c *Rsa) DumpPrivateKeyFile(filename string) error {
	block := &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(c.rsaPrivateKey),
	}
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	err = pem.Encode(file, block)
	if err != nil {
		return err
	}
	return nil
}

func (c *Rsa) DumpPrivateKeyBase64() (string, error) {
	keyBase64 := base64.StdEncoding.EncodeToString(x509.MarshalPKCS1PrivateKey(c.rsaPrivateKey))
	return keyBase64, nil
}

func (c *Rsa) DumpPublicKeyBase64() (string, error) {
	keyBytes, err := x509.MarshalPKIXPublicKey(c.rsaPublicKey)
	if err != nil {
		return "", err
	}
	keyBase64 := base64.StdEncoding.EncodeToString(keyBytes)
	return keyBase64, nil
}

// --- Private Function

func loadPrivateKeyFile(keyfile string) (*rsa.PrivateKey, error) {
	k, err := ioutil.ReadFile(keyfile)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(k)
	if block == nil {
		return nil, errors.New("private key error")
	}

	pk, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, errors.New("parse private key error")
	}

	return pk, nil
}

func loadPublicKeyFile(keyfile string) (*rsa.PublicKey, error) {
	kb, err := ioutil.ReadFile(keyfile)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(kb)
	if block == nil {
		return nil, errors.New("public key error")
	}

	pbk, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	pk := pbk.(*rsa.PublicKey)
	return pk, nil
}

func loadPrivateKeyBase64(base64key string) (*rsa.PrivateKey, error) {
	keyBytes, err := base64.StdEncoding.DecodeString(base64key)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(keyBytes)
	if block == nil {
		return nil, errors.New("private key error")
	}
	pk, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, errors.New("parse private key error")
	}
	return pk, nil
}

func loadPublicKeyBase64(base64key string) (*rsa.PublicKey, error) {
	keyBytes, err := base64.StdEncoding.DecodeString(base64key)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(keyBytes)
	if block == nil {
		return nil, errors.New("public key error")
	}
	pbk, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	pk := pbk.(*rsa.PublicKey)
	return pk, nil
}
