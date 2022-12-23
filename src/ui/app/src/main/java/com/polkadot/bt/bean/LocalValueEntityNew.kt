package com.polkadot.bt.bean

import com.polkadot.bt.room.entities.LinkEntityNew

data class LocalValueEntityNew(
    var id: Long = 0,
    var name: String = "",
    var password: String = "",
    var mnemonic: String = "",
    var isBackup: Boolean = false,
    var linkList: MutableList<LinkEntityNew> = mutableListOf()
)