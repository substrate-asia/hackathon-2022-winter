package com.polkadot.bt.room.daos

import androidx.room.*
import com.polkadot.bt.room.entities.AddressEntity

@Dao
abstract class AddressDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertAddressEntity(entity: AddressEntity): Long

    @Query("SELECT * FROM address_entity WHERE id = :id")
    abstract fun queryAddressEntity(id: Long): AddressEntity?


    @Query("SELECT * FROM address_entity")
    abstract fun queryAddressEntities(): List<AddressEntity>

    @Query("DELETE FROM address_entity WHERE id = :id")
    abstract fun deleteById(id: Long)

    @Update(entity = AddressEntity::class)
    abstract fun updateAddress(vararg entity: AddressEntity)
}