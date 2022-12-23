package com.polkadot.bt.room.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "value_entity")
data class ValueEntity(
    @PrimaryKey(autoGenerate = true)
    var id: Long,
    var name: String,
    var password: String,
    var mnemonic: String,
    var isBackup: Boolean=false
)