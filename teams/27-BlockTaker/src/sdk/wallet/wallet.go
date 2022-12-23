package wallet

import (
	"encoding/hex"
	"errors"
	"fmt"
	"sync"

	"githup.com/youthonline/ndk/core/polka"
)

// Deprecated: 这个钱包对象缓存了助记词、密码、私钥等信息，继续使用有泄露资产的风险 ⚠️
type Wallet struct {
	Mnemonic string

	Keystore string
	password string

	// cache
	multiAccounts sync.Map

	WatchAddress string
}

func NewWalletWithMnemonic(mnemonic string) (*Wallet, error) {
	if !IsValidMnemonic(mnemonic) {
		return nil, ErrInvalidMnemonic
	}
	return &Wallet{Mnemonic: mnemonic}, nil
}

// Only support Polka keystore.
func NewWalletWithKeyStore(keyStoreJson string, password string) (*Wallet, error) {
	// check keystore's password
	err := polka.CheckKeystorePassword(keyStoreJson, password)
	if err != nil {
		return nil, err
	}
	return &Wallet{
		Keystore: keyStoreJson,
		password: password,
	}, nil
}

func WatchWallet(address string) (*Wallet, error) {
	chainType := ChainTypeFrom(address)
	if chainType.Count() == 0 {
		return nil, errors.New("Invalid wallet address")
	}
	return &Wallet{WatchAddress: address}, nil
}

func (w *Wallet) IsMnemonicWallet() bool {
	return len(w.Mnemonic) > 0
}

func (w *Wallet) IsKeystoreWallet() bool {
	return len(w.Keystore) > 0
}

func (w *Wallet) IsWatchWallet() bool {
	return len(w.WatchAddress) > 0
}

func (w *Wallet) GetWatchWallet() *WatchAccount {
	return &WatchAccount{address: w.WatchAddress}
}

// Get or create the polka account with specified network.
func (w *Wallet) GetOrCreatePolkaAccount(network int) (*polka.Account, error) {
	key := fmt.Sprintf("polka-%v", network)
	if cache, ok := w.multiAccounts.Load(key); ok {
		if acc, ok := cache.(*polka.Account); ok {
			return acc, nil
		}
	}

	var account *polka.Account
	var err error
	if len(w.Mnemonic) > 0 {
		account, err = polka.NewAccountWithMnemonic(w.Mnemonic, network)
	} else if len(w.Keystore) > 0 {
		account, err = polka.NewAccountWithKeystore(w.Keystore, w.password, network)
	}
	if err != nil {
		return nil, err
	}
	// save to cache
	w.multiAccounts.Store(key, account)
	return account, nil
}

// check keystore password
func (w *Wallet) CheckPassword(password string) (bool, error) {
	err := polka.CheckKeystorePassword(w.Keystore, w.password)
	return err == nil, err
}

// Deprecated: Sign is deprecated. Please use wallet.PolkaAccount(network).Sign() instead
func (w *Wallet) Sign(message []byte, password string) (b []byte, err error) {
	account, err := w.GetOrCreatePolkaAccount(44)
	if err != nil {
		return nil, err
	}
	return account.Sign(message, password)
}

// Deprecated: SignFromHex is deprecated. Please use wallet.PolkaAccount(network).SignHex() instead
func (w *Wallet) SignFromHex(messageHex string, password string) ([]byte, error) {
	account, err := w.GetOrCreatePolkaAccount(44)
	if err != nil {
		return nil, err
	}
	bytes, err := hex.DecodeString(messageHex)
	if err != nil {
		return nil, err
	}
	return account.Sign(bytes, password)
}

// Deprecated: GetPublicKey is deprecated. Please use wallet.PolkaAccount(network).PublicKey() instead
func (w *Wallet) GetPublicKey() ([]byte, error) {
	account, err := w.GetOrCreatePolkaAccount(44)
	if err != nil {
		return nil, err
	}
	return account.PublicKey(), nil
}

// Deprecated: GetPublicKeyHex is deprecated. Please use wallet.PolkaAccount(network).PublicKey() instead
func (w *Wallet) GetPublicKeyHex() (string, error) {
	account, err := w.GetOrCreatePolkaAccount(44)
	if err != nil {
		return "", err
	}
	return account.PublicKeyHex(), nil
}

// Deprecated: GetAddress is deprecated. Please use wallet.PolkaAccount(network).Address() instead
func (w *Wallet) GetAddress(network int) (string, error) {
	account, err := w.GetOrCreatePolkaAccount(44)
	if err != nil {
		return "", err
	}
	return account.Address(), nil
}

// Deprecated: GetPrivateKeyHex is deprecated. Please use wallet.PolkaAccount(network).PrivateKey() instead
func (w *Wallet) GetPrivateKeyHex() (string, error) {
	account, err := w.GetOrCreatePolkaAccount(44)
	if err != nil {
		return "", err
	}
	return account.PrivateKeyHex()
}
