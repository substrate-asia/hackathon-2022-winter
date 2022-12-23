package com.polkadot.bt.bean

import java.io.Serializable

data class PolkadotValidatorsResult(
    val status: Int,
    val msg: String,
    val data: List<Validators>?,
    val code: Int,
)

data class Validators(
    var address: String,
    var bonded_total: Double,
    var identity: Boolean,
    var amount: String,
    var validator_prefs_value: Double,
    var count_nominators: Int,
    var nominators_min: Double,
    var reward: Double,
) : Serializable
