package com.polkadot.bt.bean

data class RetrievableAmountResult(
    val status: Int,
    val msg: String,
    val data: Amount,
    val code: Int,
)

data class Amount(
    val amount: String
)
