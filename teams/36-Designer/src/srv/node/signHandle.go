package node

import (
	"fmt"
	"net/http"

	keyring "github.com/CESSProject/go-keyring"
	"github.com/centrifuge/go-substrate-rpc-client/v4/signature"

	"github.com/gin-gonic/gin"
)

type SignReq struct {
	MnemonicWords string `json:"mnemonicWords"`
	Msg           string `json:"msg"`
}

func (n *Node) signHandle(c *gin.Context) {
	var (
		err error
		req SignReq
	)
	if err = c.ShouldBind(&req); err != nil {
		c.JSON(500, "InternalError")
		return
	}

	_, err = signature.KeyringPairFromSecret(req.MnemonicWords, 0)
	if err != nil {
		c.JSON(500, "InternalError")
		return
	}

	kr, _ := keyring.FromURI(req.MnemonicWords, keyring.NetSubstrate{})

	// output public SS58 formatted address
	ss58, _ := kr.SS58Address()

	// sign message
	msg := []byte(req.Msg)
	sig, _ := kr.Sign(kr.SigningContext(msg))

	sig_str := "["
	// sigResult := make([]byte, 64)

	var sss = sig[:]
	var ccc [64]byte
	for i := 0; i < 64; i++ {
		ccc[i] = sss[i]
	}
	// create new keyring from SS58 public address to verify message signature
	verkr, _ := keyring.FromURI(ss58, keyring.NetSubstrate{})

	if verkr.Verify(verkr.SigningContext(msg), ccc) {
		for i := 0; i < len(sig); i++ {
			sig_str += fmt.Sprintf("%v", byte(sig[i]))
			if (i + 1) < len(sig) {
				sig_str += ","
			}
			// sigResult = append(sigResult, sig[i])
		}
		sig_str += "]"
		fmt.Println(sig_str)
	} else {
		c.JSON(500, "InternalError")
		return
	}

	c.JSON(http.StatusOK, map[string]string{"result": sig_str})
	//c.JSON(http.StatusOK, map[string]string{"result": string(sigResult)})
}
