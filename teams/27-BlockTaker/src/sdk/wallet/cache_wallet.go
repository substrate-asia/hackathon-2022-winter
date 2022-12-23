package wallet

import (
	"errors"
	"fmt"

	"githup.com/youthonline/ndk/base"

	"githup.com/youthonline/ndk/core/polka"
)

type WalletType = base.SDKEnumInt

const (
	WalletTypeMnemonic   WalletType = 1
	WalletTypeKeystore   WalletType = 2
	WalletTypePrivateKey WalletType = 3
	WalletTypeWatch      WalletType = 4
	WalletTypeError      WalletType = 5
)

func isValidWalletType(typ WalletType) bool {
	return typ >= WalletTypeMnemonic && typ <= WalletTypeWatch
}

// 任意一个类可以遵循这个协议, 通过创建一个 `CacheWallet` 来计算钱包公钥、地址
// SDK 会在需要的时候从该对象读取 **助记词/keystore/私钥** 等信息
type SDKWalletSecretInfo interface {
	// 需要提供一个 key, 可以缓存钱包地址公钥信息
	SDKCacheKey() string
	// 如果是一个助记词钱包，返回助记词
	SDKMnemonic() string
	// 如果是一个 keystore 钱包，返回 keystore
	SDKKeystore() string
	// 如果是一个 keystore 钱包，返回密码
	SDKPassword() string
	// 如果是一个私钥钱包，返回私钥
	SDKPrivateKey() string
	// 如果是一个观察者钱包，返回观察地址
	SDKWatchAddress() string
}

// 旧的钱包对象在内存里面会缓存 **助记词**，还有很多链的账号 **私钥**，可能会有用户钱包被盗的风险
// 因此 SDK 里面不能缓存 **助记词** 、**私钥** 、还有 **keystore 密码**
//
// 考虑到每次都导入助记词生成账号，而仅仅是为了获取账号地址或者公钥，可能会影响钱包的性能和体验
// 因此新提供了这个可以缓存 *账号地址* 和 *公钥* 这种不敏感信息的钱包
type CacheWallet struct {
	walletType   WalletType
	watchAddress string

	WalletInfo SDKWalletSecretInfo
}

func NewCacheWallet(info SDKWalletSecretInfo) *CacheWallet {
	return &CacheWallet{WalletInfo: info}
}

// Create a watch wallet
func NewWatchWallet(address string) (*CacheWallet, error) {
	chainType := ChainTypeFrom(address)
	if chainType.Count() == 0 {
		return nil, errors.New("Invalid wallet address")
	}
	return &CacheWallet{
		walletType:   WalletTypeWatch,
		watchAddress: address,
	}, nil
}

func (w *CacheWallet) key() string {
	if w.WalletInfo == nil {
		return ""
	}
	return w.WalletInfo.SDKCacheKey()
}

// 获取钱包类型
// 枚举值见 `WalletType` (Mnemonic / Keystore / PrivateKey / Watch / Error)
func (w *CacheWallet) WalletType() WalletType {
	if typ, ok := w.checkWalletType(); ok {
		return typ
	}
	w.walletType, _ = w.readTypeAndValue()
	saveWallet(w)
	return w.walletType
}

func (w *CacheWallet) checkWalletType() (typ WalletType, ok bool) {
	if isValidWalletType(w.walletType) {
		return w.walletType, true
	}
	if cache := getWallet(w.key()); cache != nil && isValidWalletType(cache.walletType) {
		w.walletType = cache.walletType
		return cache.walletType, true
	}
	return WalletTypeError, false
}

func (w *CacheWallet) readTypeAndValue() (WalletType, string) {
	if w.WalletInfo == nil {
		return WalletTypeError, ""
	}
	if m := w.WalletInfo.SDKMnemonic(); len(m) > 24 {
		return WalletTypeMnemonic, m
	} else if k := w.WalletInfo.SDKKeystore(); len(k) > 0 {
		return WalletTypeKeystore, k
	} else if p := w.WalletInfo.SDKPrivateKey(); len(p) > 0 {
		return WalletTypePrivateKey, p
	} else if a := w.WalletInfo.SDKWatchAddress(); len(a) > 0 {
		return WalletTypeWatch, a
	} else {
		return WalletTypeError, ""
	}
}

func (w *CacheWallet) readValue(typ WalletType) (WalletType, string) {
	if w.WalletInfo == nil {
		return WalletTypeError, ""
	}
	switch typ {
	case WalletTypeMnemonic:
		return typ, w.WalletInfo.SDKMnemonic()
	case WalletTypeKeystore:
		return typ, w.WalletInfo.SDKKeystore()
	case WalletTypePrivateKey:
		return typ, w.WalletInfo.SDKPrivateKey()
	case WalletTypeWatch:
		return typ, w.WalletInfo.SDKWatchAddress()
	default:
		return WalletTypeError, ""
	}
}

func (w *CacheWallet) PolkaAccountInfo(network int) *AccountInfo {
	return &AccountInfo{
		Wallet:   w,
		cacheKey: fmt.Sprintf("polka-%v", network),
		mnemonicCreator: func(val string) (base.Account, error) {
			return polka.NewAccountWithMnemonic(val, network)
		},
		keystoreCreator: func(val string) (base.Account, error) {
			pwd := w.WalletInfo.SDKPassword()
			return polka.NewAccountWithKeystore(val, pwd, network)
		},
		privkeyCreator: func(val string) (base.Account, error) {
			return polka.AccountWithPrivateKey(val, network)
		},
	}
}
