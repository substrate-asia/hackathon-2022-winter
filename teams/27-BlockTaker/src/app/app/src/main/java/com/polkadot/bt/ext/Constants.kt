package com.polkadot.bt.ext

import com.polkadot.bt.BuildConfig

object Constants {
    const val SCAN_RESULT = 200
    const val CURRENT_VALUE = "current_value"
    const val VALUE_IS_EYE = "value_is_eye"
    const val NETWORK_ENABLE = "network_enable"

    //web3J 地址 测试用

    const val ETH_URL = BuildConfig.ETH_URL
    const val BNB_URL = BuildConfig.BNB_URL
    const val HT_URL = BuildConfig.HT_URL
    const val AVAX_URL = BuildConfig.AVAX_URL
    const val MATIC_URL = BuildConfig.MATIC_URL
    const val DOT_URL = BuildConfig.DOT_URL
    const val DOT_NETWORK = BuildConfig.DOT_NETWORK

    //历史记录key
    const val API_KEY_DOT = "feef568c00f445d3aedd66beb1307d5e"
    const val API_KEY_ETH = "KC6BIJRECIAWHC85U3SKHXKC4929PU3X5H"
    const val API_KEY_BNB = "P4K4YPF9UIRHIAQESKC2NBJEA4JGZ94Y52"
    const val API_KEY_AVAX = "GRN54S9WK1RC3AKSACJNAKQHA4JQ5S87ZG"
    const val API_KEY_MATIC = "2YFB8NZVDEPPPSTSNVEWR37S9AUVX3CYGI"

    //web看历史记录
    const val API_HISTORY_BTC = "https://www.blockchain.com/btc/address/"
    const val API_HISTORY_BNB = BuildConfig.BNB_HISTORY_WEB_URL
    const val API_HISTORY_OMNI = "https://www.omniexplorer.info/search/"


    //交易详情地址
    const val API_WEBVIEW_DOT = BuildConfig.DOT_DETAIL_WEB_URL
    const val API_WEBVIEW_BTC = "https://www.blockchain.com/btc/tx/"
    const val API_WEBVIEW_ETH = BuildConfig.ETH_DETAIL_WEB_URL
    const val API_WEBVIEW_BNB = "https://bscscan.com/tx/"
    const val API_WEBVIEW_HECO = "https://www.hecoinfo.com/tx/"
    const val API_WEBVIEW_AVAX = "https://snowtrace.io/tx/"
    const val API_WEBVIEW_MATIC = "https://polygonscan.com/tx/"

    //BTC获取 字节价格 地址
    const val API_BTC_SINGLEPRICE="https://bitcoinfees.earn.com/"

    //私钥密钥对存放位置
    const val INDEX_PRIVATE_KEY = 4
    //助记词密钥对存放位置
    const val INDEX_MNEMONIC = 5
    //密码密钥对存放位置
    const val INDEX_PWD = 6

    //老密钥对存放位置
    const val INDEX_OLD_PRIVATE_KEY = 9

    //闪兑获取 token接口
    const val API_SWAP="https://api.1inch.io/v4.0/"

    const val SWAP_LINK_ETH=1
    const val SWAP_LINK_BNB=56
    const val SWAP_LINK_MATIC=137
    const val SWAP_LINK_AVAX=43114

    const val FINGERPRINT_ENABLE = "fingerprint"

    const val POLKADOT_OPTION_BASE_URL = "http://47.108.71.73:9555/"

}
