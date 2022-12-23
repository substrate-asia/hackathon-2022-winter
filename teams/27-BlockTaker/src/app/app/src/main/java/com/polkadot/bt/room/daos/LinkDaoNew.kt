package com.polkadot.bt.room.daos

import androidx.room.*
import com.polkadot.bt.room.entities.LinkEntityNew

@Dao
abstract class LinkDaoNew {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertLinkEntity(entity: LinkEntityNew): Long

    @Query("SELECT * FROM link_entity WHERE id = :id")
    abstract fun queryLinkEntity(id: Long): LinkEntityNew?

    @Query("SELECT * FROM link_entity WHERE valueId = :valueId")
    abstract fun queryLinkEntitiesByValueId(valueId: Long): List<LinkEntityNew>

    @Query("SELECT * FROM link_entity WHERE privateKey = :key AND link= :link")
    abstract fun queryLinkEntitiesByKey(key: ByteArray,link:String): List<LinkEntityNew>

    @Query("DELETE FROM link_entity WHERE valueId = :valueId")
    abstract fun deleteByValueId(valueId: Long)

    @Query("DELETE FROM link_entity WHERE coinAddress = :coinAddress AND valueId = :valueId AND channel= :channel" )
    abstract fun deleteByCoinAddress(coinAddress: String,valueId: Long,channel:String)
}