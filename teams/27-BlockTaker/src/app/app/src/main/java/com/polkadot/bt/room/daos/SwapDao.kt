package com.polkadot.bt.room.daos

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.polkadot.bt.room.entities.SwapEntity

@Dao
abstract class SwapDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertSwapEntity(entity: SwapEntity): Long



    @Query("SELECT * FROM swap_entity")
    abstract fun querySwapEntities(): List<SwapEntity>

}