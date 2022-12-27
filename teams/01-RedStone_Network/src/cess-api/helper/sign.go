package helper

import (
	"log"

	keyring "github.com/CESSProject/go-keyring"
	"github.com/centrifuge/go-substrate-rpc-client/v4/signature"
)

func GetSign(mnemonic string, message string) ([64]byte, error) {
	var defaultByte [64]byte
	_, err := signature.KeyringPairFromSecret(mnemonic, 0)
	if err != nil {
		log.Println("[err] Wrong mnemonic" + err.Error())
		return defaultByte, err
	}

	kr, err := keyring.FromURI(mnemonic, keyring.NetSubstrate{})
	if err != nil {
		log.Println("[err] Wrong key" + err.Error())
		return defaultByte, err
	}
	// output public SS58 formatted address
	// ss58, _ := kr.SS58Address()

	// sign message
	msg := []byte(message)
	sig, err := kr.Sign(kr.SigningContext(msg))
	if err != nil {
		log.Println("[err] Wrong mnemonic" + err.Error())
		return defaultByte, err
	}

	return sig, nil

	// sig_str := "["

	// var sss = sig[:]
	// var ccc [64]byte
	// for i := 0; i < 64; i++ {
	// 	ccc[i] = sss[i]
	// }

	// create new keyring from SS58 public address to verify message signature
	//verkr, _ := keyring.FromURI(ss58, keyring.NetSubstrate{})

	// if verkr.Verify(verkr.SigningContext(msg), ccc) {
	// 	for i := 0; i < len(sig); i++ {
	// 		sig_str += fmt.Sprintf("%v", byte(sig[i]))
	// 		if (i + 1) < len(sig) {
	// 			sig_str += ","
	// 		}
	// 	}
	// 	sig_str += "]"
	// 	fmt.Println(sig_str)
	// } else {
	// 	fmt.Println("Failed")
	// }
}
