package com.polkadot.bt.bean

data class GasPrice(
    val slow:String,
    val mid:String,
    val fast:String

)
data class BtcGasPrice(
    val fastestFee: String,
    val halfHourFee: String,
    val hourFee: String
)