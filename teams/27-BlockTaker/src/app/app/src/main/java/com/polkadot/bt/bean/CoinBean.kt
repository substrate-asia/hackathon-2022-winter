package com.polkadot.bt.bean

import com.polkadot.bt.R

data class CoinBean(
    val name: String = "",
    val fullName: String = "",
    val icon: Int = -1,
    var isChecked: Boolean = false,
    var isCreated: Boolean = false,
    var isLoading: Boolean = false
)

fun getMainLinks():ArrayList<CoinBean>{
    return  arrayListOf(
        CoinBean("DOT", "Polkadot", R.drawable.mainlink_icon_polkadot, true),
        CoinBean("BTC", "Bitcoin", R.drawable.mainlink_icon_bitcoin, true),
        CoinBean("ETH", "Ethereum", R.drawable.mainlink_icon_ethereum, true),
        CoinBean("BNB", "BNB Chain", R.drawable.mainlink_icon_binance, false),
        CoinBean("HT", "Huobi ECO Chain", R.drawable.mainlink_icon_ht, false),
        CoinBean("AVAX", "Avalanche", R.drawable.mainlink_icon_avalanche, false),
        CoinBean("MATIC", "Polygon", R.drawable.mainlink_icon_matictoken, false)
    )
}
fun getSwapLinks():ArrayList<CoinBean>{
    return  arrayListOf(
        CoinBean("ETH", "Ethereum", R.drawable.mainlink_icon_ethereum, true),
        CoinBean("BNB", "BNB Chain", R.drawable.mainlink_icon_binance, true),
        CoinBean("AVAX", "Avalanche", R.drawable.mainlink_icon_avalanche, false),
        CoinBean("MATIC", "Polygon", R.drawable.mainlink_icon_matictoken, false)
    )
}
fun getMainLinkIcon(link:String):Int{
    return  when (link){
        "DOT" -> R.drawable.mainlink_icon_polkadot
        "BTC"->R.drawable.mainlink_icon_bitcoin
        "ETH"-> R.drawable.mainlink_icon_ethereum
        "BNB"-> R.drawable.mainlink_icon_binance
        "HT"-> R.drawable.mainlink_icon_ht
        "AVAX"-> R.drawable.mainlink_icon_avalanche
        "MATIC"-> R.drawable.mainlink_icon_matictoken
        else ->-1
    }
}