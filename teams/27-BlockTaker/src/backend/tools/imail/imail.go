package imail

import (
	"github.com/jordan-wright/email"
	"net/smtp"
)

type MailType struct {
	MailHost     string `json:"mail_host"`     //邮箱服务器 smtp.126.com
	MailPort     string `json:"mail_port"`     //邮箱端口 25
	MailNickname string `json:"mail_nickname"` //发送人昵称 samir
	MailAccount  string `json:"mail_account"`  //发送人账号 samir@163.com
	MailPassword string `json:"mail_password"` //发送人密码 xxxxxxx
}

func NewMail(host, port, nickname, account, password string) *MailType {
	return &MailType{
		MailHost:     host,
		MailPort:     port,
		MailNickname: nickname,
		MailAccount:  account,
		MailPassword: password,
	}
}

func (t *MailType) Send(to []string, subject, content string, html bool) error {
	e := email.NewEmail()
	e.From = t.MailNickname + " <" + t.MailAccount + ">"
	e.To = to
	e.Cc = []string{}
	e.Subject = subject
	if html {
		e.HTML = []byte(content)
	} else {
		e.Text = []byte(content)
	}
	if err := e.Send(t.MailHost+":"+t.MailPort, smtp.PlainAuth("", t.MailAccount, t.MailPassword, t.MailHost)); err != nil {
		return err
	}
	return nil
}
