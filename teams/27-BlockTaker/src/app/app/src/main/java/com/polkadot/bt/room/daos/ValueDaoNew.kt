package com.polkadot.bt.room.daos

import androidx.room.*
import com.polkadot.bt.room.entities.ValueEntityNew
import com.polkadot.bt.room.entities.ValueNameEntity
import com.polkadot.bt.room.entities.ValuePasswordEntity

@Dao
abstract class ValueDaoNew {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertValueEntity(entity: ValueEntityNew): Long

    @Query("SELECT * FROM value_entity WHERE id = :id")
    abstract fun queryValueEntity(id: Long): ValueEntityNew?

    @Query("SELECT * FROM value_entity WHERE mnemonic = :mnemonic")
    abstract fun queryValueEntityByMnemonic(mnemonic: ByteArray): ValueEntityNew?

    @Query("SELECT * FROM value_entity")
    abstract fun queryValueEntities(): List<ValueEntityNew>

    @Query("DELETE FROM value_entity WHERE id = :id")
    abstract fun deleteById(id: Long)

    @Update(entity = ValueEntityNew::class)
    abstract fun updateValue(vararg entity: ValueNameEntity)

    @Update(entity = ValueEntityNew::class)
    abstract fun updateValuePassword(vararg entity: ValuePasswordEntity)
}