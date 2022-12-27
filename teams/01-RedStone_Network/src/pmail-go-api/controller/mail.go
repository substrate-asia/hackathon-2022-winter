package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"reflect"
	"strings"
	"time"

	"log"

	"os"

	"github.com/gin-gonic/gin"
	"golang.org/x/net/html"

	"net/smtp"
	"pmail_api/helper"

	"github.com/emersion/go-imap"
	"github.com/emersion/go-imap/client"
	"github.com/emersion/go-message/charset"
	"github.com/emersion/go-message/mail"
)

type Mail struct {
	Subject   string          `json:"subject"`
	Body      string          `json:"body"`
	From      []*mail.Address `json:"from"`
	To        []*mail.Address `json:"to"`
	Date      time.Time       `json:"date"`
	TimeStamp uint64          `json:"timestampe"`
}

type CreateMailRequest struct {
	Subject   string          `json:"subject"`
	Body      string          `json:"body"`
	From      []*mail.Address `json:"from"`
	To        []*mail.Address `json:"to"`
	Date      string          `json:"date"`
	TimeStamp uint64          `json:"timestampe"`
}

type CreateMailInfo struct {
	EmailName string   `form:"emailname" json:"emailname" binding:"required"`
	From      string   `form:"from" json:"from" binding:"required"`
	To        []string `form:"to" json:"to" binding:"required"`
	Cc        []string `form:"cc" json:"cc" binding:"required"`
	Bcc       []string `form:"bcc" json:"bcc" binding:"required"`
	Subject   string   `form:"subject" json:"subject" binding:"required"`
	Text      string   `form:"text" json:"text" binding:"required"`
	Html      string   `form:"html" json:"html" binding:"required"`
}

type CreateMailWithHahInfo struct {
	EmailName string   `form:"emailname" json:"emailname" binding:"required"`
	From      string   `form:"from" json:"from" binding:"required"`
	To        []string `form:"to" json:"to" binding:"required"`
	Html      string   `form:"html" json:"html" binding:"required"`
	Hash      string   `form:"hash" json:"hash" binding:"required"`
}

func MergeSlice(s1 []string, s2 []string) []string {
	slice := make([]string, len(s1)+len(s2))
	copy(slice, s1)
	copy(slice[len(s1):], s2)
	return slice
}
func containsKey(m, k interface{}) bool {
	v := reflect.ValueOf(m).MapIndex(reflect.ValueOf(k))
	return v != reflect.Value{}
}

// send mail to mail serve
func SendToMail(user, password, host, subject, body, mailtype, replyToAddress string, to, cc, bcc []string) error {
	//hp := strings.Split(host, ":")
	//auth := smtp.PlainAuth("", user, password, host)
	// fmt.Println("----- Sending to mail...")
	auth := helper.LoginAuth(user, password)
	var content_type string
	if mailtype == "html" {
		content_type = "Content-Type: text/" + mailtype + "; charset=UTF-8"
	} else {
		content_type = "Content-Type: text/plain" + "; charset=UTF-8"
	}

	cc_address := strings.Join(cc, ";")
	bcc_address := strings.Join(bcc, ";")
	to_address := strings.Join(to, ";")
	msg := []byte("To: " + to_address + "\r\nFrom: " + user + "\r\nSubject: " + subject + "\r\nReply-To: " + replyToAddress + "\r\nCc: " + cc_address + "\r\nBcc: " + bcc_address + "\r\n" + content_type + "\r\n\r\n" + body)

	send_to := MergeSlice(to, cc)
	send_to = MergeSlice(send_to, bcc)

	// fmt.Println("host",host)
	// fmt.Println("auth",auth)
	// fmt.Println("-----user",user)
	// fmt.Println("-----to",send_to)
	// fmt.Println("msg",msg)

	err := smtp.SendMail(host, auth, user, send_to, msg)
	// fmt.Println("smpt failed:",err)
	return err
}

// create mail by from, to, subject, body
func CreateMail(context *gin.Context) {
	var mapAccountInfo map[string]string
	byte_account_infos := os.Getenv("ACCOUNT_INFO")
	err := json.Unmarshal([]byte(byte_account_infos), &mapAccountInfo)
	if err != nil {
		log.Println(err)

		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not get ACCOUNT_INFO!"})
		return
	}

	data, _ := ioutil.ReadAll(context.Request.Body)

	var mailInfo CreateMailInfo
	if json.Unmarshal(data, &mailInfo) != nil {
		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not parse Info in body!"})
		return
	}

	if !containsKey(mapAccountInfo, mailInfo.EmailName) {
		log.Println("####full struct is {}", mapAccountInfo, mailInfo.EmailName)

		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not get user info in database! " + mailInfo.EmailName})
		return
	}
	pass := mapAccountInfo[mailInfo.EmailName]

	mailhost := os.Getenv("MAIL_HOST")
	mailtype := "txt"

	fmt.Println("@@@@send email")
	err = SendToMail(mailInfo.EmailName,
		pass,
		mailhost+":587",
		mailInfo.Subject,
		mailInfo.Text,
		mailtype,
		mailInfo.EmailName,
		mailInfo.To,
		mailInfo.Cc,
		mailInfo.Bcc)
	if err != nil {
		fmt.Println("Send mail error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not send mail! because " + err.Error()})
		return
	} else {
		fmt.Println("Send mail success!")
	}

	context.JSON(http.StatusOK, gin.H{"data": "", "code": 0, "msg": "ok"})
}

// create mail by from, to, mail store hash
func CreateMailWithHash(context *gin.Context) {

	// fmt.Println("-----Creating a web2 mail...")

	var mapAccountInfo map[string]string
	byte_account_infos := os.Getenv("ACCOUNT_INFO")
	err := json.Unmarshal([]byte(byte_account_infos), &mapAccountInfo)
	if err != nil {
		log.Println(err)
		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not get ACCOUNT_INFO!"})
		return
	}

	data, _ := ioutil.ReadAll(context.Request.Body)

	// fmt.Println("-----Get post body:",data)

	var mailInfo CreateMailWithHahInfo
	if json.Unmarshal(data, &mailInfo) != nil {
		log.Println(err)
		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not parse Info in body!"})
		return
	}

	if !containsKey(mapAccountInfo, mailInfo.EmailName) {
		log.Println("####full struct is {}: ", mapAccountInfo, mailInfo.EmailName)
		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not get user info in database! " + mailInfo.EmailName})
		return
	}
	pass := mapAccountInfo[mailInfo.EmailName]

	// fmt.Println("-----Get mail info:",mailInfo)

	hash_store, err := helper.GetFile(mailInfo.Hash)
	if err != nil {
		log.Println(err)

		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not get mailinfo from hash!"})
		return
	}
	var mailFromHash CreateMailRequest
	err = json.Unmarshal(hash_store, &mailFromHash)
	if err != nil {
		log.Println("##### can not parse mail from hash store!", err)
		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not parse mail from hash store!"})
		return
	}

	mailhost := os.Getenv("MAIL_HOST")

	var mailtype string
	_, err = html.Parse(strings.NewReader(mailFromHash.Body))
	if err != nil {
		mailtype = "html"
	} else {
		mailtype = "txt"
	}

	// fmt.Println("-----user,password",mailInfo.EmailName,pass)

	fmt.Println("@@@@send email")
	err = SendToMail(mailInfo.EmailName,
		pass,
		mailhost+":587",
		mailFromHash.Subject,
		mailFromHash.Body,
		mailtype,
		mailInfo.EmailName,
		mailInfo.To,
		nil,
		nil,
	)
	if err != nil {
		fmt.Println("Send mail error!", err.Error())
		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not send mail! because " + err.Error()})
		return
	} else {
		fmt.Println("Send mail success!")
	}

	context.JSON(http.StatusOK, gin.H{"data": "success", "code": 0, "msg": "ok"})
}

// get mail list by account
func GetMails(context *gin.Context) {
	log.Println("##in GetMails")

	var mapAccountInfo map[string]string
	byte_account_infos := os.Getenv("ACCOUNT_INFO")
	err := json.Unmarshal([]byte(byte_account_infos), &mapAccountInfo)
	if err != nil {
		log.Println(err)

		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not get ACCOUNT_INFO!"})
		return
	}

	imap.CharsetReader = charset.Reader

	emailname := context.DefaultQuery("emailname", "test1")

	mailhost := os.Getenv("MAIL_HOST")
	mailport := os.Getenv("MAIL_PORT")

	if !containsKey(mapAccountInfo, emailname) {
		log.Println("####full struct is {}", mapAccountInfo, emailname)

		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can not get user info in database! " + emailname})
		return
	}
	pass := mapAccountInfo[emailname]

	c, err := client.DialTLS(mailhost+":"+mailport, nil)
	if err != nil {
		log.Println("client dial tls failed", err)
	}
	log.Println("Connected")
	defer c.Logout()

	// Login
	if err := c.Login(emailname, pass); err != nil {
		log.Println(err)
	}
	log.Println("Logged in")

	// List mailboxes
	mailboxes := make(chan *imap.MailboxInfo, 10)
	done := make(chan error, 1)
	go func() {
		done <- c.List("", "*", mailboxes)
	}()

	log.Println("Mailboxes:")
	for m := range mailboxes {
		log.Println("*BOX " + m.Name)
	}

	if err := <-done; err != nil {
		log.Println(err)
	}

	// Select INBOX
	mbox, err := c.Select("INBOX", false)
	if err != nil {
		log.Println(err)

		context.JSON(http.StatusOK, gin.H{"data": "", "code": 1, "msg": "can no select inbox!"})
		return
	}
	log.Println("Flags for INBOX:", mbox.Flags)

	// Get the last max_count messages
	var max_count uint32 = 100
	from := uint32(1)
	to := mbox.Messages
	if mbox.Messages > max_count {
		// We're using unsigned integers here, only subtract if the result is > 0
		from = mbox.Messages - max_count
	}
	seqset := new(imap.SeqSet)
	seqset.AddRange(from, to)

	messages := make(chan *imap.Message, 100)
	done = make(chan error, 1)
	var section = &imap.BodySectionName{}
	items := []imap.FetchItem{section.FetchItem()}

	go func() {
		done <- c.Fetch(seqset, items, messages)
	}()

	log.Println("Last max_count messages:")

	var maillist []Mail

	for msg := range messages {
		var mailInfo Mail
		r := msg.GetBody(section)
		if r == nil {
			log.Println("get body from server fail!")
		}
		mr, err := mail.CreateReader(r)
		if err != nil {
			log.Println(err)
		}

		header := mr.Header
		var subject string
		if date, err := header.Date(); err == nil {
			mailInfo.Date = date
			mailInfo.TimeStamp = uint64(date.UnixMilli())
			//log.Println("Date:", date, reflect.TypeOf(date))
		}
		if from, err := header.AddressList("From"); err == nil {
			mailInfo.From = from
			//log.Println("From:", from, reflect.TypeOf(from))
		}
		if to, err := header.AddressList("To"); err == nil {
			mailInfo.To = to
			//log.Println("To:", to, reflect.TypeOf(to))
		}
		if subject, err = header.Subject(); err == nil {
			mailInfo.Subject = subject
			//log.Println("Subject:", subject, reflect.TypeOf(subject))
		}

		// 处理邮件正文
		for {
			p, err := mr.NextPart()
			if err == io.EOF {
				break
			} else if err != nil {
				log.Println("NextPart:err ", err)
			}

			switch h := p.Header.(type) {
			case *mail.InlineHeader:
				// 正文消息文本
				b, _ := ioutil.ReadAll(p.Body)
				// mailFile := fmt.Sprintf("INBOX/%s.eml", subject)
				// f, _ := os.OpenFile(mailFile, os.O_RDWR|os.O_CREATE, 0766)
				// f.Write(b)
				// f.Close()
				//log.Printf("body: %v\n", string(b[:]))
				mailInfo.Body = string(b[:])

			case *mail.AttachmentHeader:
				// 正文内附件
				filename, _ := h.Filename()
				log.Printf("attachment: %v\n", filename)
			}
		}

		maillist = append(maillist, mailInfo)

	}

	if err := <-done; err != nil {
		log.Println(err)
	}

	log.Println("Done!")

	context.JSON(http.StatusOK, gin.H{"data": maillist, "code": 0, "msg": "ok"})
}
