package com.polkadot.bt.bean

import com.polkadot.bt.room.entities.LinkEntity

data class LocalValueEntity(
    var id: Long = 0,
    var name: String = "",
    var password: String = "",
    var mnemonic: String = "",
    var isBackup: Boolean = false,
    val linkList: MutableList<LinkEntity> = mutableListOf()
)