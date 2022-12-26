package com.polkadot.bt.room.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.io.Serializable


@Entity(tableName = "swap_entity")
data  class SwapEntity (
    @PrimaryKey(autoGenerate = true)
    var id: Long,
    val fromSymbol:String,
    val toSymbol:String,
    val fromTokenAmount: String,
    val toTokenAmount: String,
    val gas: String,
    val gasPrice: String,
    val from: String,
    val to: String,
    val value: String,
    val time:Long
    ):Serializable