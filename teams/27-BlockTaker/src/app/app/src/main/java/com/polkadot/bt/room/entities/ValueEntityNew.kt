package com.polkadot.bt.room.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "value_entity")
data class ValueEntityNew(
    @PrimaryKey(autoGenerate = true)
    var id: Long,
    var name: String,
    var password: ByteArray = byteArrayOf(),
    var mnemonic: ByteArray = byteArrayOf(),
    var isBackup: Boolean=false
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ValueEntityNew

        if (id != other.id) return false
        if (name != other.name) return false
        if (!password.contentEquals(other.password)) return false
        if (!mnemonic.contentEquals(other.mnemonic)) return false
        if (isBackup != other.isBackup) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + name.hashCode()
        result = 31 * result + password.contentHashCode()
        result = 31 * result + mnemonic.contentHashCode()
        result = 31 * result + isBackup.hashCode()
        return result
    }
}

data class ValueNameEntity(
    var id: Long,
    var name: String,
)
data class ValuePasswordEntity(
    var id: Long,
    var password: ByteArray = byteArrayOf(),
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ValuePasswordEntity

        if (id != other.id) return false
        if (!password.contentEquals(other.password)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + password.contentHashCode()
        return result
    }
}