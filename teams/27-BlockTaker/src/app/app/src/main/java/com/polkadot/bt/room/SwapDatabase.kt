package com.polkadot.bt.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Transaction
import com.polkadot.bt.room.daos.SwapDao
import com.polkadot.bt.room.entities.SwapEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext


@Database(
    entities = [SwapEntity::class],
    version = 1,
    exportSchema = false
)
    abstract class SwapDatabase :RoomDatabase(){
    abstract fun swapDao(): SwapDao
    companion object {
        private const val DB_NAME = "swap_entity"
        private var instance: SwapDatabase? = null
        fun get(context: Context): SwapDatabase {
            return instance ?: synchronized(SwapDatabase::class) {
                instance ?: Room.databaseBuilder(context, SwapDatabase::class.java, DB_NAME).allowMainThreadQueries()
                    .build().also {
                        instance = it
                    }
            }
        }
    }


    suspend fun getSwaps(): List<SwapEntity> {
        return withContext(Dispatchers.IO) {
            swapDao().querySwapEntities()
        }
    }
    @Transaction
    suspend fun insertSwap(value: SwapEntity): Long {
        return withContext(Dispatchers.IO) {
            try {
                val id = swapDao().insertSwapEntity(
                    value
                )
                return@withContext id
            } catch (t: Throwable) {
                t.printStackTrace()
            }
            1L
        }
    }


}