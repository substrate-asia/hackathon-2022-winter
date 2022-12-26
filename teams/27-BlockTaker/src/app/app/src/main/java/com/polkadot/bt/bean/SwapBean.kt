package com.polkadot.bt.bean

data class ListToken(
    val tokens: HashMap<String,Token>
)

data class Token(
    val address: String,
    val decimals: Int,
    val logoURI: String,
    val name: String,
    val symbol: String
)

data class SwapBean(
    val fromToken:Token,
    val toToken:Token,
    val fromTokenAmount: String,
    val toTokenAmount: String,
    val tx:TxBean
)

data class TxBean(
    val `data`: String,
    val from: String,
    val gas: String,
    val gasPrice: String,
    val to: String,
    val value: String
)

