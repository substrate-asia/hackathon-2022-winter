package chain

import (
	"log"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const (
	testnetRpcAddr = "wss://testnet-rpc0.cess.cloud/ws/"
	mnemonicWords  = "slim duck actor kingdom frown father grant lounge coach guide inherit purity"
)

func TestClient_GetChainState(t *testing.T) {
	c, _ := NewChainClient(testnetRpcAddr, mnemonicWords, time.Second*15)
	assert.True(t, c.GetChainState(), "")
}

func TestClient_GetAccountInfo(t *testing.T) {
	c, _ := NewChainClient(testnetRpcAddr, mnemonicWords, time.Second*15)
	acctInfo, err := c.GetAccountInfo(c.GetPublicKey())
	if err != nil {
		panic(err)
	}
	log.Printf("Account info: %+v", acctInfo)
}

func TestClient_CreateBucket(t *testing.T) {
	c, _ := NewChainClient(testnetRpcAddr, mnemonicWords, time.Second*15)
	tx, err := c.CreateBucket(c.GetPublicKey(), "mysite1")
	if err != nil {
		panic(err)
	}

	log.Printf("Create bucket tx: %s", tx)
}

func TestClient_DeleteBucket(t *testing.T) {
	c, _ := NewChainClient(testnetRpcAddr, mnemonicWords, time.Second*15)
	tx, err := c.DeleteBucket(c.GetPublicKey(), "mysite1")
	if err != nil {
		panic(err)
	}

	log.Printf("Delete bucket tx: %s", tx)
}

func TestClient_GetBucketList(t *testing.T) {
	c, _ := NewChainClient(testnetRpcAddr, mnemonicWords, time.Second*15)
	bktList, err := c.GetBucketList(c.GetPublicKey())
	if err != nil {
		panic(err)
	}

	buckets := make([]string, len(bktList))
	for i := 0; i < len(bktList); i++ {
		buckets[i] = string(bktList[i][:])
	}
	log.Printf("Bucket list: %+v", buckets)
}

func TestClient_GetBucketInfo(t *testing.T) {
	c, _ := NewChainClient(testnetRpcAddr, mnemonicWords, time.Second*15)
	bktInfo, err := c.GetBucketInfo(c.GetPublicKey(), "test1")
	if err != nil {
		panic(err)
	}

	log.Printf("Bucket info: %+v\n", bktInfo)

	for _, obj := range bktInfo.Objects_list {
		log.Printf("File id: %s\n", string(obj[:]))
	}
}

func TestClient_GetFileMetaInfo(t *testing.T) {
	c, _ := NewChainClient(testnetRpcAddr, mnemonicWords, time.Second*15)
	f, err := c.GetFileMetaInfo("7776a0acbad5098a8767a44c442b98ef2e33ee7b0abce96c8661b02baaa41710")
	if err != nil {
		panic(err)
	}
	log.Printf("File Meta: %+v", f)
	log.Printf("File State Field: %s", string(f.State))
	for _, ub := range f.UserBriefs {
		log.Printf("File UserBrief Field: user=%s fileName=%s bucketName=%s", ub.User.ToHexString(), string(ub.File_name), string(ub.Bucket_name))
	}
}

func TestClient_DeleteFile(t *testing.T) {
	c, _ := NewChainClient(testnetRpcAddr, mnemonicWords, time.Second*15)
	tx, err := c.DeleteFile(c.GetPublicKey(), "71d75db7ffedd39f243f60a1474953a9e3ae91cc6726e3e801a73e780413f9bc")
	if err != nil {
		panic(err)
	}
	log.Printf("Delete file tx: %s", tx)
}
