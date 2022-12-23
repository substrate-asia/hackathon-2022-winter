package com.polkadot.bt.room

import android.content.Context
import android.util.Log
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.polkadot.bt.bean.LocalValueEntity
import com.polkadot.bt.ext.Constants
import com.polkadot.bt.ext.Utils
import com.polkadot.bt.ext.VebZteKeyService
import com.polkadot.bt.room.daos.LinkDao
import com.polkadot.bt.room.daos.ValueDao
import com.polkadot.bt.room.entities.LinkEntity
import com.polkadot.bt.room.entities.ValueEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Database(
    entities = [ValueEntity::class, LinkEntity::class],
    version = 1,
    exportSchema = false
)
abstract class ValueDatabase: RoomDatabase() {
    abstract fun valueDao(): ValueDao
    abstract fun linkDao(): LinkDao

    companion object {
        private const val DB_NAME = "value_database"
        private var instance: ValueDatabase? = null
        fun get(context: Context): ValueDatabase {
            return instance ?: synchronized(ValueDatabase::class) {
                instance ?: Room.databaseBuilder(context, ValueDatabase::class.java, DB_NAME).allowMainThreadQueries()
                    .build().also {
                        instance = it
                    }
            }
        }
    }


    suspend fun deleteValue(id: Long) {
        withContext(Dispatchers.IO) {
            linkDao().deleteByValueId(id)
            valueDao().deleteById(id)
        }
    }

    suspend fun getAllValue(): List<LocalValueEntity> {
        return withContext(Dispatchers.IO) {
            val allValue = mutableListOf<LocalValueEntity>()
            valueDao().queryValueEntities().forEach {
                setValue(it.id)?.let { bean ->
                    allValue.add(bean)
                }
            }
            allValue
        }
    }

    suspend fun setValue(id: Long): LocalValueEntity? {
        return withContext(Dispatchers.IO) {
            valueDao().queryValueEntity(id)?.let { valueEntity ->
                val value = LocalValueEntity()
                value.id = valueEntity.id
                value.name = valueEntity.name
                value.password = valueEntity.password
                value.mnemonic = valueEntity.mnemonic
                value.isBackup = valueEntity.isBackup
                linkDao().queryLinkEntitiesByValueId(valueEntity.id).let { list ->
                    list.forEach {
                        if (Utils.isMeta()) {
                            it.privateKey = VebZteKeyService.instance()?.service?.Decrypt(it.privateKey, Constants.INDEX_OLD_PRIVATE_KEY)?: byteArrayOf()
                            Log.e("ValeDatabase", "解密后${String(it.privateKey)}")
                        }
                    }
                    value.linkList.addAll(list)
                }
                value
            }
        }
    }
}