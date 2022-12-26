package itoken

import (
	"encoding/json"
	"errors"
	"github.com/dgrijalva/jwt-go"
	"time"
)

type claims struct {
	Attr []byte
	jwt.StandardClaims
}

// Enc 生成jwt token，会进行json序列化
// data 用户自定义加密数据，建议使用结构体
// expire 过期时间
// sign 签名秘钥
func Enc(data interface{}, expire time.Duration, sign []byte) (string, error) {
	attr, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	// 创建JWT声明，其中包括用户名和有效时间
	param := &claims{
		Attr: attr,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(expire).Unix(),
		},
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, param).SignedString(sign)
	if err != nil {
		return "", err
	}
	return token, nil
}

// Dec 解析jwt token，并解析到用户结构体上
// data 用户自定义结构体
// token token字符串
// sign 签名秘钥
func Dec(data interface{}, token string, sign []byte) error {
	var value claims
	res, err := jwt.ParseWithClaims(token, &value, func(token *jwt.Token) (interface{}, error) {
		return sign, nil
	})
	if err != nil {
		return err
	}
	if !res.Valid {
		return errors.New("bad token")
	}
	if err = json.Unmarshal(value.Attr, &data); err != nil {
		return err
	}
	return nil
}
