package com.polkadot.bt.bean

data class ListRateBean(
    val count: Int,
    val list: List<RateBean>
)

data class RateBean(
    val create_time: Int,
    val delete_time: Int,
    val from: String,
    val id: Int,
    val name: String,
    val nameDesc: String,
    val price: String,
    val to: String,
    val update_time: Int
)