package com.polkadot.bt.bean

import java.io.Serializable

data class HistoryBean(
    val message: String,
    val result: List<HistoryItem>,
    val status: String
)

data class HistoryItem(
    var timeStamp: String,
    var to: String,
    var from: String,
    var value: String,
//    val blockHash: String,
//    val blockNumber: String,
//    val confirmations: String,
//    val contractAddress: String,
//    val cumulativeGasUsed: String,
//    val functionName: String,
    val gas: String,
    val gasPrice: String,
//    val gasUsed: String,
    val hash: String,
//    val input: String,
//    val isError: String,
//    val methodId: String,
//    val nonce: String,
//    val transactionIndex: String,
    val txreceipt_status: String

):Serializable




data class BaseBean(
    val code: Int,
    val data: ListEntity,
    val msg: String
)

data class ListEntity(
    val count: Int,
    val list: List<BtcHistory>
)

data class BtcHistory (
    val amount: Double,
    val blockHash: String,
    val fromAddr: String,
    val id: Int,
    val time: Int,
    val toAddr: String,
    val txHash: String,
    val txId: String
)