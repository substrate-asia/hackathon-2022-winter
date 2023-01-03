package com.polkadot.bt.room.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.io.Serializable

@Entity(tableName = "address_entity")
data class AddressEntity(
    @PrimaryKey(autoGenerate = true)
    var id: Long,
    var linkType: String,
    var linkIcon:String,
    var addressName: String,
    var addressContent: String,
    var describes: String
):Serializable