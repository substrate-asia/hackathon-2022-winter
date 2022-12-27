package chain

import (
	"fmt"

	"github.com/CESSProject/cess-oss/pkg/utils"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types/codec"
	"github.com/pkg/errors"
)

// GetPublicKey returns your own public key
func (c *Client) GetPublicKey() []byte {
	return c.keyring.PublicKey
}

func (c *Client) GetMnemonicSeed() string {
	return c.keyring.URI
}

func (c *Client) GetSyncStatus() (bool, error) {
	if !c.IsChainClientOk() {
		return false, ERR_RPC_CONNECTION
	}
	h, err := c.api.RPC.System.Health()
	if err != nil {
		return false, err
	}
	return h.IsSyncing, nil
}

func (c *Client) GetChainStatus() bool {
	return c.GetChainState()
}

// GetStorageMinerInfo gets miner information on the chain
func (c *Client) GetStorageMinerInfo(pkey []byte) (MinerInfo, error) {
	var data MinerInfo

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return data, ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_Sminer,
		minerItems,
		pkey,
	)
	if err != nil {
		return data, errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return data, errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return data, ERR_RPC_EMPTY_VALUE
	}
	return data, nil
}

// GetAllStorageMiner gets all miner information on the cess chain
func (c *Client) GetAllStorageMiner() ([]types.AccountID, error) {
	var data []types.AccountID

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return data, ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_Sminer,
		allMinerItems,
	)
	if err != nil {
		return nil, errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return nil, errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return nil, ERR_RPC_EMPTY_VALUE
	}
	return data, nil
}

// GetFileMetaInfo get file meta info with given fid
func (c *Client) GetFileMetaInfo(fid string) (FileMetaInfo, error) {
	var (
		data FileMetaInfo
		hash FileHash
	)

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return data, ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	if len(hash) != len(fid) {
		return data, errors.New("invalid file hash")
	}

	for i := 0; i < len(hash); i++ {
		hash[i] = types.U8(fid[i])
	}

	b, err := codec.Encode(hash)
	if err != nil {
		return data, errors.Wrap(err, "[Encode]")
	}

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_FileBank,
		fileMetaInfo,
		b,
	)
	if err != nil {
		return data, errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return data, errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return data, ERR_RPC_EMPTY_VALUE
	}
	return data, nil
}

func (c *Client) GetCessAccount() (string, error) {
	return utils.EncodePublicKeyAsCessAccount(c.keyring.PublicKey)
}

func (c *Client) GetAccountInfo(pkey []byte) (types.AccountInfo, error) {
	var data types.AccountInfo

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return data, ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	b, err := c.getEncodedAccountId(pkey)
	if err != nil {
		return data, errors.Wrap(err, "[EncodeToBytes]")
	}

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_System,
		account,
		b,
	)
	if err != nil {
		return data, errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return data, errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return data, ERR_RPC_EMPTY_VALUE
	}
	return data, nil
}

func (c *Client) GetState(pubkey []byte) (string, error) {
	var data Ipv4Type

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return "", ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	b, err := c.getEncodedAccountId(pubkey)
	if err != nil {
		return "", errors.Wrap(err, "[EncodeToBytes]")
	}

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_Oss,
		oss,
		b,
	)
	if err != nil {
		return "", errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return "", errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return "", ERR_RPC_EMPTY_VALUE
	}

	return fmt.Sprintf("%d.%d.%d.%d:%d",
		data.Value[0],
		data.Value[1],
		data.Value[2],
		data.Value[3],
		data.Port), nil
}

func (c *Client) GetGrantor(pkey []byte) (types.AccountID, error) {
	var data types.AccountID

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return data, ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	b, err := c.getEncodedAccountId(pkey)
	if err != nil {
		return data, errors.Wrap(err, "[EncodeToBytes]")
	}

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_Oss,
		Grantor,
		b,
	)
	if err != nil {
		return data, errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return data, errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return data, ERR_RPC_EMPTY_VALUE
	}
	return data, nil
}

func (c *Client) GetBucketInfo(owner_pkey []byte, name string) (BucketInfo, error) {
	var data BucketInfo

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return data, ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	owner, err := c.getEncodedAccountId(owner_pkey)
	if err != nil {
		return data, errors.Wrap(err, "[EncodeToBytes]")
	}

	name_byte, err := codec.Encode(name)
	if err != nil {
		return data, errors.Wrap(err, "[Encode]")
	}

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_FileBank,
		fileBank_Bucket,
		owner,
		name_byte,
	)
	if err != nil {
		return data, errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return data, errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return data, ERR_RPC_EMPTY_VALUE
	}
	return data, nil
}

func (c *Client) GetBucketList(owner_pkey []byte) ([]types.Bytes, error) {
	var data []types.Bytes

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return data, ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	owner, err := c.getEncodedAccountId(owner_pkey)
	if err != nil {
		return data, errors.Wrap(err, "[EncodeToBytes]")
	}

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_FileBank,
		fileBank_BucketList,
		owner,
	)
	if err != nil {
		return data, errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return data, errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return data, ERR_RPC_EMPTY_VALUE
	}
	return data, nil
}

// GetSchedulerList gets scheduler information on the cess chain
func (c *Client) GetSchedulerList() ([]SchedulerInfo, error) {
	var data []SchedulerInfo

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return data, ERR_RPC_CONNECTION
	}
	c.SetChainState(true)

	key, err := types.CreateStorageKey(
		c.metadata,
		pallet_FileMap,
		schedulerMap,
	)
	if err != nil {
		return data, errors.Wrap(err, "[CreateStorageKey]")
	}

	ok, err := c.api.RPC.State.GetStorageLatest(key, &data)
	if err != nil {
		return data, errors.Wrap(err, "[GetStorageLatest]")
	}
	if !ok {
		return data, ERR_RPC_EMPTY_VALUE
	}
	return data, nil
}

// internal function used to generate encoded account id with given public key
func (c *Client) getEncodedAccountId(publicKey []byte) ([]byte, error) {
	acctId, err := types.NewAccountID(publicKey)
	if err != nil {
		return nil, err
	}

	b, err := codec.Encode(acctId)
	if err != nil {
		return nil, err
	}

	return b, nil
}

func (c *Client) MustAccountIdFromPublicKey(publicKey []byte) *types.AccountID {
	acctId, err := types.NewAccountID(publicKey)
	if err != nil {
		panic(err)
	}
	return acctId
}
