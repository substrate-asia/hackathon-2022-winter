package com.polkadot.bt.room.daos

import androidx.room.*
import com.polkadot.bt.room.entities.ValueEntity

@Dao
abstract class ValueDao {

    @Query("SELECT * FROM value_entity WHERE id = :id")
    abstract fun queryValueEntity(id: Long): ValueEntity?

    @Query("SELECT * FROM value_entity")
    abstract fun queryValueEntities(): List<ValueEntity>

    @Query("DELETE FROM value_entity WHERE id = :id")
    abstract fun deleteById(id: Long)

}