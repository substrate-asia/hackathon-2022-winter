package com.polkadot.bt.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Transaction
import com.polkadot.bt.room.daos.AddressDao
import com.polkadot.bt.room.entities.AddressEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext


@Database(
    entities = [AddressEntity::class],
    version = 1,
    exportSchema = false
)
    abstract class AddressDatabase :RoomDatabase(){
    abstract fun addressDao(): AddressDao
    companion object {
        private const val DB_NAME = "address_entity"
        private var instance: AddressDatabase? = null
        fun get(context: Context): AddressDatabase {
            return instance ?: synchronized(AddressDatabase::class) {
                instance ?: Room.databaseBuilder(context, AddressDatabase::class.java, DB_NAME).allowMainThreadQueries()
                    .build().also {
                        instance = it
                    }
            }
        }
    }


    suspend fun getAddress(): List<AddressEntity> {
        return withContext(Dispatchers.IO) {
            addressDao().queryAddressEntities()
        }
    }
    suspend fun deleteValue(id: Long) {
        withContext(Dispatchers.IO) {
            addressDao().deleteById(id)
        }
    }
    @Transaction
    suspend fun insertAddress(value: AddressEntity): Long {
        return withContext(Dispatchers.IO) {
            try {
                val id = addressDao().insertAddressEntity(
                    value
                )
                return@withContext id
            } catch (t: Throwable) {
                t.printStackTrace()
            }
            1L
        }
    }

    suspend fun updateAddress(entity: AddressEntity) {
        withContext(Dispatchers.IO) {
            addressDao().updateAddress(entity)
        }
    }

}