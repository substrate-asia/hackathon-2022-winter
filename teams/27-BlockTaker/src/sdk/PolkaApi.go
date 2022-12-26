package main

import "C"

import (
	"fmt"
	"strconv"
	"strings"

	"githup.com/youthonline/ndk/core/polka"
)

const NETWORK = 42

//export getBalance
func getBalance(rpcurl *C.char, scanurl *C.char, address *C.char) *C.char {
	chain, _ := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	bal, err := chain.BalanceOfAddress(C.GoString(address))
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString(bal.Usable + ":" + bal.Total + ":" + bal.Locked)
}

//export fetchTransactionDetail
func fetchTransactionDetail(rpcurl, scanurl, txhash *C.char) *C.char {
	chain, _ := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	txdetail, err := chain.FetchTransactionDetail(C.GoString(txhash))
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString(txdetail.HashString + ":" + txdetail.Amount + ":" + txdetail.EstimateFees + ":" + txdetail.FromAddress + ":" + txdetail.ToAddress + ":" + strconv.Itoa(txdetail.Status) + ":" + strconv.Itoa(int(txdetail.FinishTimestamp)) + ":" + txdetail.FailureMessage + ":" + txdetail.CIDNumber + ":" + txdetail.TokenName)
}

func fetchTransactionDetailV2(rpcurl, scanurl, txhash, apikey *C.char) *C.char {
	chain, _ := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	txdetail, err := chain.FetchTransactionDetailV2(C.GoString(txhash), C.GoString(apikey))
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString(txdetail.HashString + ":" + txdetail.Amount + ":" + txdetail.EstimateFees + ":" + txdetail.FromAddress + ":" + txdetail.ToAddress + ":" + strconv.Itoa(txdetail.Status) + ":" + strconv.Itoa(int(txdetail.FinishTimestamp)) + ":" + txdetail.FailureMessage + ":" + txdetail.CIDNumber + ":" + txdetail.TokenName)
}

//export newAccountWithMnemonic
func newAccountWithMnemonic(mnemonic *C.char, network C.int) *C.char {
	account, err := polka.NewAccountWithMnemonic(C.GoString(mnemonic), int(network))
	if err != nil {
		return C.CString(err.Error())
	}
	privkey, _ := account.PrivateKeyHex()
	return C.CString(account.Address() + ":" + account.PublicKeyHex() + ":" + privkey)
}

//export accountWithPrivKey
func accountWithPrivKey(privateKey *C.char, network C.int) *C.char {
	account, err := polka.AccountWithPrivateKey(C.GoString(privateKey), int(network))
	if err != nil {
		return C.CString(err.Error())
	}
	privkey, _ := account.PrivateKeyHex()
	return C.CString(account.Address() + ":" + account.PublicKeyHex() + ":" + privkey)
}

//export sendRawTransaction
func sendRawTransaction(rpcurl, scanurl, signTX *C.char) *C.char {
	chain, _ := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	hash, err := chain.SendRawTransaction(C.GoString(signTX))
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString(hash)
}

//export signTX
func signTX(privkey, data *C.char) *C.char {
	_prikey := C.GoString(privkey)
	_data := C.GoString(data)

	account, err := polka.NewAccountWithMnemonic(_prikey, NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign([]byte(_data), "")
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(string(signatrue))
}

//export generateTransferSignData
func generateTransferSignData(rpcurl, scanUrl, from, to, amount *C.char) *C.char {
	signdata, err := polka.GenerateTransferSignData(C.GoString(rpcurl), C.GoString(scanUrl), C.GoString(from), C.GoString(to), C.GoString(amount))
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(string(signdata))
}

//export generateTransferTx
func generateTransferTx(rpcurl, scanUrl, from, to, amount, privkey *C.char) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanUrl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}
	transaction, err := tx.NewBalanceTransferTx(C.GoString(to), C.GoString(amount))
	if err != nil {
		return C.CString(err.Error())
	}

	signdata, err := chain.GetSignData(transaction, C.GoString(from))
	if err != nil {
		return C.CString(err.Error())
	}

	fmt.Println("call data: ", polka.ByteToHex(signdata))
	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)
}

//export generateSendTx
func generateSendTx(metadata, txhash, sigdata, privkey *C.char) *C.char {
	tx, err := polka.NewTx(C.GoString(metadata))
	if err != nil {
		return C.CString(err.Error())
	}

	transaction, err := tx.NewTransactionFromHex(C.GoString(txhash))
	if err != nil {
		return C.CString(err.Error())
	}

	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign([]byte(C.GoString(sigdata)), "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)
}

func getTransactionStatus(rpcurl, scanurl, txHexStr *C.char) *C.char {
	chain, _ := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	status := chain.FetchTransactionStatus(C.GoString(txHexStr))
	return C.CString(strconv.Itoa(status))
}

//export getTransactionStatusV2
func getTransactionStatusV2(rpcurl, scanurl, txHexStr, apikey *C.char) *C.char {
	chain, _ := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	status := chain.FetchTransactionStatusV2(C.GoString(txHexStr), C.GoString(apikey))
	return C.CString(strconv.Itoa(status))
}

//export generateTransferHex
func generateTransferHex(rpcurl, dest, amount *C.char) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(rpcurl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}
	transaction, err := tx.NewBalanceTransferTx(C.GoString(dest), C.GoString(amount))
	if err != nil {
		return C.CString(err.Error())
	}
	hex, err := transaction.GetUnSignTx()
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString(hex)
}

//export estimateFeesForTransaction
func estimateFeesForTransaction(rpcurl, scanurl, txhash *C.char) *C.char {
	chain, _ := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	tx, err := chain.GetTx()
	if err != nil {
		return C.CString(err.Error())
	}
	transaction, err := tx.NewTransactionFromHex(C.GoString(txhash))
	if err != nil {
		return C.CString(err.Error())
	}
	fee, err := chain.EstimateFeeForTransaction(transaction)
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString(fee)
}

//export estimateFeesForTransactionV2
func estimateFeesForTransactionV2(rpcurl, scanurl, sendtx *C.char) *C.char {
	chain, _ := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	fee, err := chain.EstimateFeeForTransactionV2(C.GoString(sendtx))
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString(fee)
}

//export stakeBound
func stakeBound(rpcurl, scanUrl, stash, controller, value, payee, privkey *C.char) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanUrl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}
	transaction, err := tx.NewStakingBondTx(C.GoString(controller), C.GoString(value), C.GoString(payee))
	if err != nil {
		return C.CString(err.Error())
	}

	signdata, err := chain.GetSignData(transaction, C.GoString(stash))
	if err != nil {
		return C.CString(err.Error())
	}

	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)
}

//export stakeNominate
func stakeNominate(rpcurl, scanUrl, stash, targets, privkey *C.char) *C.char {
	nomiTargets := strings.Split(C.GoString(targets), ":")
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanUrl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}
	transaction, err := tx.NewNominateTx(nomiTargets)
	if err != nil {
		return C.CString(err.Error())
	}
	signdata, err := chain.GetSignData(transaction, C.GoString(stash))
	if err != nil {
		return C.CString(err.Error())
	}
	fmt.Println("call data: ", polka.ByteToHex(signdata))
	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)
}

//export stakeUnbond
func stakeUnbond(rpcurl, scanUrl, stash, value, privkey *C.char) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanUrl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}
	transaction, err := tx.NewUnBoundTx(C.GoString(value))
	if err != nil {
		return C.CString(err.Error())
	}

	signdata, err := chain.GetSignData(transaction, C.GoString(stash))
	if err != nil {
		return C.CString(err.Error())
	}

	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)
}

//export withDraw
func withDraw(rpcurl, scanUrl, stash, privkey *C.char, span C.int) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanUrl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}
	transaction, err := tx.NewWithDrawUnbondTx(uint32(span))
	if err != nil {
		return C.CString(err.Error())
	}

	signdata, err := chain.GetSignData(transaction, C.GoString(stash))
	if err != nil {
		return C.CString(err.Error())
	}

	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)
}

//export chillAndUnbond
func chillAndUnbond(rpcurl, scanUrl, stash, value, privkey *C.char) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanUrl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}

	transaction, err := tx.NewChillAndUnbondTx(C.GoString(value))
	if err != nil {
		return C.CString(err.Error())
	}

	signdata, err := chain.GetSignData(transaction, C.GoString(stash))
	if err != nil {
		return C.CString(err.Error())
	}

	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)

}

//export bondAndNominate
func bondAndNominate(rpcurl, scanUrl, stash, controller, value, targets, privkey *C.char) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanUrl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}
	nomiTargets := strings.Split(C.GoString(targets), ":")

	transaction, err := tx.NewBondAndNominateTx(C.GoString(stash), C.GoString(controller), C.GoString(value), nomiTargets)
	if err != nil {
		return C.CString(err.Error())
	}
	signdata, err := chain.GetSignData(transaction, C.GoString(stash))
	if err != nil {
		return C.CString(err.Error())
	}

	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)
}

//export bondExtra
func bondExtra(rpcurl, scanUrl, stash, value, privkey *C.char) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanUrl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}

	transaction, err := tx.NewStakingBondExtraTx(C.GoString(value))
	if err != nil {
		return C.CString(err.Error())
	}
	signdata, err := chain.GetSignData(transaction, C.GoString(stash))
	if err != nil {
		return C.CString(err.Error())
	}

	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)
}

//export getAccountStatus
func getAccountStatus(rpcurl, scanurl, accStr, apikey *C.char) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	if err != nil {
		return C.CString(err.Error())
	}
	data, err := chain.GetAccountStatusV2(C.GoString(accStr), C.GoString(apikey))
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(data.Total + ":" + data.Bonded + ":" + data.Locked + ":" + data.Unbonding)
}

//export payOutStakers
func payOutStakers(rpcurl, scanurl, stash, validate, privkey *C.char, era C.int) *C.char {
	chain, err := polka.NewChainWithRpc(C.GoString(rpcurl), C.GoString(scanurl))
	if err != nil {
		return C.CString(err.Error())
	}
	metadata, err := chain.GetMetadataString()
	if err != nil {
		return C.CString(err.Error())
	}
	tx, err := polka.NewTx(metadata)
	if err != nil {
		return C.CString(err.Error())
	}

	transaction, err := tx.NewPayoutStakesTx(C.GoString(stash), uint32(era))
	if err != nil {
		return C.CString(err.Error())
	}
	signdata, err := chain.GetSignData(transaction, C.GoString(stash))
	if err != nil {
		return C.CString(err.Error())
	}

	account, err := polka.NewAccountWithMnemonic(C.GoString(privkey), NETWORK)
	if err != nil {
		return C.CString(err.Error())
	}

	signatrue, err := account.Sign(signdata, "")
	if err != nil {
		return C.CString(err.Error())
	}

	sendTx, err := transaction.GetTx(account.PublicKey(), signatrue)
	if err != nil {
		return C.CString(err.Error())
	}

	return C.CString(sendTx)

}

func main() {

}
