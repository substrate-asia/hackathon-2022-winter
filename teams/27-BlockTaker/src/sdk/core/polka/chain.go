package polka

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"math/big"
	"net/http"
	"strconv"
	"strings"

	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/decred/base58"
	"github.com/itering/subscan/util/ss58"
	"githup.com/youthonline/ndk/base"
	"githup.com/youthonline/ndk/pkg/httpUtil"
)

type Chain struct {
	RpcUrl  string
	ScanUrl string
}

// @param rpcUrl will be used to get metadata, query balance, estimate fee, send signed tx.
// @param scanUrl will be used to query transaction details
func NewChainWithRpc(rpcUrl, scanUrl string) (*Chain, error) {
	return &Chain{
		RpcUrl:  rpcUrl,
		ScanUrl: scanUrl,
	}, nil
}

// MARK - Implement the protocol Chain

func (c *Chain) MainToken() base.Token {
	return &Token{chain: c}
}

// Note: Only chainx have XBTC token.
func (c *Chain) XBTCToken() *XBTCToken {
	return &XBTCToken{chain: c}
}

func (c *Chain) BalanceOfAddress(address string) (*base.Balance, error) {
	ss58Format := base58.Decode(address)
	if len(ss58Format) == 0 {
		return nil, errors.New("The address ss58 format is invalid")
	}
	pubkey, err := hex.DecodeString(ss58.Decode(address, int(ss58Format[0])))
	if err != nil {
		return base.EmptyBalance(), err
	}
	return c.queryBalance(pubkey)
}

func (c *Chain) BalanceOfPublicKey(publicKey string) (*base.Balance, error) {
	publicKey = strings.TrimPrefix(publicKey, "0x")
	data, err := hex.DecodeString(publicKey)
	if err != nil {
		return base.EmptyBalance(), ErrPublicKey
	}
	return c.queryBalance(data)
}

func (c *Chain) StakingLedger(address string) (*base.StakingStatus, error) {
	ss58Format := base58.Decode(address)
	if len(ss58Format) == 0 {
		return nil, errors.New("The address ss58 format is invalid")
	}
	pubkey, err := hex.DecodeString(ss58.Decode(address, int(ss58Format[0])))
	if err != nil {
		return nil, err
	}
	return c.queryStakingStatus(pubkey)
}

func (c *Chain) BalanceOfAccount(account base.Account) (*base.Balance, error) {
	return c.BalanceOfPublicKey(account.PublicKeyHex())
}

func (c *Chain) SendRawTransaction(signedTx string) (s string, err error) {
	defer base.CatchPanicAndMapToBasicError(&err)

	client, err := getConnectedPolkaClient(c.RpcUrl)
	if err != nil {
		return
	}

	var hashString string
	err = client.api.Client.Call(&hashString, "author_submitExtrinsic", signedTx)
	if err != nil {
		return
	}

	return hashString, nil
}

func (c *Chain) GetAccountStatusV2(accStr, apikey string) (*base.StakingStatus, error) {
	if c.ScanUrl == "" {
		return nil, errors.New("Scan url is Empty.")
	}
	reqMap := make(map[string]string)
	reqMap["key"] = accStr

	bodyJson, err := json.Marshal(reqMap)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", c.ScanUrl, bytes.NewReader(bodyJson))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apikey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	respDict := make(map[string]interface{})
	err = json.Unmarshal(body, &respDict)
	if err != nil {
		return nil, err
	}

	if respDict["message"].(string) != "Success" {
		return nil, errors.New(respDict["message"].(string))
	}
	if respDict["data"] == nil {
		return nil, errors.New("not exsit")
	}

	var balance string
	var bonded string
	var locked string
	var unbonding string

	dict, ok := respDict["data"].(map[string]interface{})

	if ok {
		status, ok := dict["account"].(map[string]interface{})
		if ok {
			balance, _ = status["balance"].(string)
			bonded, _ = status["bonded"].(string)
			locked, _ = status["lock"].(string)
			unbonding, _ = status["unbonding"].(string)

		}
	}

	return &base.StakingStatus{
		Total:     balance,
		Bonded:    bonded,
		Locked:    locked,
		Unbonding: unbonding,
	}, nil

}

func (c *Chain) FetchTransactionDetailV2(hashString, apikey string) (*base.TransactionDetail, error) {
	if c.ScanUrl == "" {
		return nil, errors.New("Scan url is Empty.")
	}
	reqMap := make(map[string]string)
	reqMap["hash"] = hashString

	bodyJson, err := json.Marshal(reqMap)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", c.ScanUrl, bytes.NewReader(bodyJson))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apikey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	respDict := make(map[string]interface{})
	err = json.Unmarshal(body, &respDict)
	if err != nil {
		return nil, err
	}
	if respDict["message"].(string) != "Success" {
		return nil, errors.New(respDict["message"].(string))
	}
	if respDict["data"] == nil {
		return nil, errors.New("not exsit")
	}

	dict, ok := respDict["data"].(map[string]interface{})

	var timestamp float64
	var from string
	var to string
	var amount string
	var status_trans bool

	if ok {
		transfer, ok := dict["transfer"].(map[string]interface{})
		if ok {
			timestamp, _ = transfer["block_timestamp"].(float64)
			from, _ = transfer["from"].(string)
			to, _ = transfer["to"].(string)
			amount, _ = transfer["amount"].(string)
			status_trans, _ = transfer["success"].(bool)

		}
	}

	fee, _ := dict["fee"].(string)
	status := base.TransactionStatusNone

	pengding, _ := dict["pending"].(bool)
	if pengding {
		status = base.TransactionStatusPending
	} else {
		finalized, _ := dict["success"].(bool)
		if finalized && status_trans {
			status = base.TransactionStatusSuccess
		} else {
			status = base.TransactionStatusFailure
		}
	}

	return &base.TransactionDetail{
		HashString:      hashString,
		Amount:          amount,
		EstimateFees:    fee,
		FromAddress:     from,
		ToAddress:       to,
		Status:          status,
		FinishTimestamp: int64(timestamp),
	}, nil

}

func (c *Chain) FetchNoTransferStatusV2(hashString, apikey string) (base.TransactionStatus, error) {
	if c.ScanUrl == "" {
		return -1, errors.New("Scan url is Empty.")
	}
	reqMap := make(map[string]string)
	reqMap["hash"] = hashString

	bodyJson, err := json.Marshal(reqMap)
	if err != nil {
		return -1, err
	}
	req, err := http.NewRequest("POST", c.ScanUrl, bytes.NewReader(bodyJson))
	if err != nil {
		return -1, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apikey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return -1, err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return -1, err
	}
	respDict := make(map[string]interface{})
	err = json.Unmarshal(body, &respDict)
	if err != nil {
		return -1, err
	}
	if respDict["message"].(string) != "Success" {
		return -1, errors.New(respDict["message"].(string))
	}
	if respDict["data"] == nil {
		return -1, errors.New("not exsit")
	}

	dict, ok := respDict["data"].(map[string]interface{})

	var status base.TransactionStatus
	var success bool
	if ok {
		success, _ = dict["success"].(bool)
		pengding, _ := dict["pending"].(bool)
		if pengding {
			status = base.TransactionStatusPending
		} else {
			finalized, _ := dict["success"].(bool)
			if finalized && success {
				status = base.TransactionStatusSuccess
			} else {
				status = base.TransactionStatusFailure
			}
		}
		return status, nil
	}
	return base.TransactionStatusNone, nil
}

func (c *Chain) FetchTransactionDetail(hashString string) (*base.TransactionDetail, error) {
	if c.ScanUrl == "" {
		return nil, errors.New("Scan url is Empty.")
	}
	url := strings.TrimSuffix(c.ScanUrl, "/") + "/" + hashString

	response, err := httpUtil.Request(http.MethodGet, url, nil, nil)
	if err != nil {
		return nil, err
	}

	if response.Code != http.StatusOK {
		return nil, fmt.Errorf("code: %d, body: %s", response.Code, string(response.Body))
	}
	respDict := make(map[string]interface{})
	err = json.Unmarshal(response.Body, &respDict)
	if err != nil {
		return nil, err
	}

	// decode informations
	amount, _ := respDict["txAmount"].(string)
	fee, _ := respDict["fee"].(string)
	from, _ := respDict["signer"].(string)
	to, _ := respDict["txTo"].(string)
	timestamp, _ := respDict["blockTime"].(float64)

	status := base.TransactionStatusNone
	finalized, _ := respDict["finalized"].(bool)
	if finalized {
		success, _ := respDict["success"].(bool)
		if success {
			status = base.TransactionStatusSuccess
		} else {
			status = base.TransactionStatusFailure
		}
	} else {
		status = base.TransactionStatusPending
	}

	return &base.TransactionDetail{
		HashString:      hashString,
		Amount:          amount,
		EstimateFees:    fee,
		FromAddress:     from,
		ToAddress:       to,
		Status:          status,
		FinishTimestamp: int64(timestamp),
	}, nil
}

func (c *Chain) FetchTransactionStatus(hashString string) base.TransactionStatus {
	detail, err := c.FetchTransactionDetail(hashString)
	if err != nil {
		return base.TransactionStatusNone
	}
	return detail.Status
}

func (c *Chain) FetchTransactionStatusV2(hashString, apikey string) base.TransactionStatus {
	detail, err := c.FetchTransactionDetailV2(hashString, apikey)
	if err != nil {
		return base.TransactionStatusNone
	}
	return detail.Status
}

func (c *Chain) BatchFetchTransactionStatus(hashListString string) string {
	hashList := strings.Split(hashListString, ",")
	statuses, _ := base.MapListConcurrentStringToString(hashList, func(s string) (string, error) {
		return strconv.Itoa(c.FetchTransactionStatus(s)), nil
	})
	return strings.Join(statuses, ",")
}

func (c *Chain) queryStakingStatus(pubkey []byte) (b *base.StakingStatus, err error) {
	defer base.CatchPanicAndMapToBasicError(&err)

	client, err := getConnectedPolkaClient(c.RpcUrl)
	if err != nil {
		return
	}

	err = client.LoadMetadataIfNotExists()
	if err != nil {
		return
	}

	call, err := types.CreateStorageKey(client.metadata, "Staking", "Ledger", pubkey)
	if err != nil {
		return
	}

	data := struct {
		Stash     string
		Total     types.U128
		Active    types.U128
		Unlocking []struct {
			Value types.U128
			Era   uint32
		}
		ClaimedRewards []uint32
	}{}

	ok, err := client.api.RPC.State.GetStorageLatest(call, &data)
	if err != nil {
		fmt.Println("GetStorageLatest : ", err)
		return
	}
	if !ok {
		return
	}

	fmt.Println("Staking  Ledger : ", data.Stash)
	fmt.Println("Staking  Ledger : ", data.Total)
	fmt.Println("Staking  Ledger : ", data.Active)

	fmt.Println("Staking  Ledger : ", data.ClaimedRewards[1])
	fmt.Println("Staking  Ledger : ", data.Unlocking)

	return
}

// query balance with pubkey data.
func (c *Chain) queryBalance(pubkey []byte) (b *base.Balance, err error) {
	defer base.CatchPanicAndMapToBasicError(&err)
	b = base.EmptyBalance()

	client, err := getConnectedPolkaClient(c.RpcUrl)
	if err != nil {
		return
	}

	err = client.LoadMetadataIfNotExists()
	if err != nil {
		return
	}

	call, err := types.CreateStorageKey(client.metadata, "System", "Account", pubkey)
	if err != nil {
		return
	}

	data := struct {
		Nonce       uint32
		Consumers   uint32
		Providers   uint32
		Sufficients uint32
		Data        struct {
			Free       types.U128
			Reserved   types.U128
			MiscFrozen types.U128
			FeeFrozen  types.U128
		}
	}{}

	// Ok is true if the value is not empty.
	ok, err := client.api.RPC.State.GetStorageLatest(call, &data)
	if err != nil {
		return
	}
	if !ok {
		return
	}

	totalInt := big.NewInt(0).Add(data.Data.Free.Int, data.Data.Reserved.Int)
	locked := base.MaxBigInt(data.Data.MiscFrozen.Int, data.Data.FeeFrozen.Int)
	usableInt := big.NewInt(0).Sub(data.Data.Free.Int, locked)

	return &base.Balance{
		Total:  totalInt.String(),
		Locked: locked.String(),
		Usable: usableInt.String(),
	}, nil
}
