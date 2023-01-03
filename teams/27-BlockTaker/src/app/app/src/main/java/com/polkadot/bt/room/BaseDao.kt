package com.polkadot.bt.room

import androidx.room.*

@Dao
interface BaseDao<T> {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insert(element: T): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertList(elements: List<T>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertSome(vararg elements: T)

    @Delete
    fun delete(element: T)

    @Delete
    fun deleteList(elements: List<T>)

    @Delete
    fun deleteSome(vararg elements: T)
}