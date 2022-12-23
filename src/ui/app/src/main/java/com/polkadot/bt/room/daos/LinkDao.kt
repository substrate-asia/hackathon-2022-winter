package com.polkadot.bt.room.daos

import androidx.room.*
import com.polkadot.bt.room.entities.LinkEntity

@Dao
abstract class LinkDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertLinkEntity(entity: LinkEntity): Long

    @Query("SELECT * FROM link_entity WHERE id = :id")
    abstract fun queryLinkEntity(id: Long): LinkEntity?

    @Query("SELECT * FROM link_entity WHERE valueId = :valueId")
    abstract fun queryLinkEntitiesByValueId(valueId: Long): List<LinkEntity>

    @Query("SELECT * FROM link_entity WHERE privateKey = :key AND link= :link")
    abstract fun queryLinkEntitiesByKey(key: ByteArray,link:String): List<LinkEntity>

    @Query("DELETE FROM link_entity WHERE valueId = :valueId")
    abstract fun deleteByValueId(valueId: Long)

    @Query("DELETE FROM link_entity WHERE coinAddress = :coinAddress AND valueId = :valueId AND channel= :channel" )
    abstract fun deleteByCoinAddress(coinAddress: String,valueId: Long,channel:String)
}