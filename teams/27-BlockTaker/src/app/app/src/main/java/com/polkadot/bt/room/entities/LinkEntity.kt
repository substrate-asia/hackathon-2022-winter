package com.polkadot.bt.room.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.io.Serializable

@Entity(tableName = "link_entity")
data class LinkEntity(
    @PrimaryKey(autoGenerate = true)
    var id: Long=1L,
    var valueId: Long=1L,
    var link: String="",
    var icon: String="",
    var mnemonic: String="",
    var privateKey: ByteArray = byteArrayOf(),
    var address: String="",
    var linkId: String="",
    var fileName: String="",
    var linkNumber:String="0",
    var linkPrice:String="0",
    var coinAddress:String="",
    var isSelect:Boolean=false,
    var channel:String="",
    var decimals:Int=18

):Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as LinkEntity

        if (id != other.id) return false
        if (valueId != other.valueId) return false
        if (link != other.link) return false
        if (icon != other.icon) return false
        if (mnemonic != other.mnemonic) return false
        if (!privateKey.contentEquals(other.privateKey)) return false
        if (address != other.address) return false
        if (linkId != other.linkId) return false
        if (fileName != other.fileName) return false
        if (linkNumber != other.linkNumber) return false
        if (linkPrice != other.linkPrice) return false
        if (coinAddress != other.coinAddress) return false
        if (isSelect != other.isSelect) return false
        if (channel != other.channel) return false
        if (decimals != other.decimals) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + valueId.hashCode()
        result = 31 * result + link.hashCode()
        result = 31 * result + icon.hashCode()
        result = 31 * result + mnemonic.hashCode()
        result = 31 * result + privateKey.contentHashCode()
        result = 31 * result + address.hashCode()
        result = 31 * result + linkId.hashCode()
        result = 31 * result + fileName.hashCode()
        result = 31 * result + linkNumber.hashCode()
        result = 31 * result + linkPrice.hashCode()
        result = 31 * result + coinAddress.hashCode()
        result = 31 * result + isSelect.hashCode()
        result = 31 * result + channel.hashCode()
        result = 31 * result + decimals
        return result
    }
}