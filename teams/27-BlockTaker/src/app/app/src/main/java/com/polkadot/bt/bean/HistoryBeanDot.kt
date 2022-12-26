package com.polkadot.bt.bean

import java.io.Serializable

data class HistoryBeanDot(
    val message: String,
    val data: HistoryBeanDotData,
    val code: Int,
    val generated_at: Long
)

data class HistoryBeanDotData(
    val count:Int,
    val transfers:List<HistoryDotItem>
)

data class HistoryDotItem(
    var block_timestamp: String,
    var to: String,
    var from: String,
    var amount: String,
    var amount_v2: String,
//    val blockHash: String,
//    val blockNumber: String,
//    val confirmations: String,
//    val contractAddress: String,
//    val cumulativeGasUsed: String,
//    val functionName: String,
    val fee: String,
//    val gasPrice: String,
//    val gasUsed: String,
    val hash: String,
//    val input: String,
//    val isError: String,
//    val methodId: String,
//    val nonce: String,
//    val transactionIndex: String,
//    val txreceipt_status: String

):Serializable
