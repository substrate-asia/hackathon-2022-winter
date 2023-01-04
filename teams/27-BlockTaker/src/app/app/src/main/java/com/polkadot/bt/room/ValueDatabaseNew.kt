package com.polkadot.bt.room

import android.content.Context
import android.util.Log
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Transaction
import com.blankj.utilcode.util.ToastUtils
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.ext.*
import com.polkadot.bt.room.daos.LinkDaoNew
import com.polkadot.bt.room.daos.ValueDaoNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.room.entities.ValueEntityNew
import com.polkadot.bt.room.entities.ValueNameEntity
import com.polkadot.bt.room.entities.ValuePasswordEntity
import com.polkadot.bt.ui.channel.ImportActivity.Companion.MNEMONIC
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Database(
    entities = [ValueEntityNew::class, LinkEntityNew::class],
    version = 1,
    exportSchema = false
)
abstract class ValueDatabaseNew : RoomDatabase() {
    abstract fun valueDao(): ValueDaoNew
    abstract fun linkDao(): LinkDaoNew

    companion object {
        private const val DB_NAME = "value_database_new"
        private var instance: ValueDatabaseNew? = null
        fun get(context: Context): ValueDatabaseNew {
            return instance ?: synchronized(ValueDatabaseNew::class) {
                instance ?: Room.databaseBuilder(context, ValueDatabaseNew::class.java, DB_NAME).allowMainThreadQueries()
                    .build().also {
                        instance = it
                    }
            }
        }
    }

    suspend fun isValueExist(info: String, type: String, link: String): Boolean {
        return withContext(Dispatchers.IO) {
            val values = getAllValue()
            var isValueExist = false
            if (type == MNEMONIC) {
                val infoList = info.split(" ").toMutableList()
                values.forEach {
                    val wordList = it.mnemonic.split(" ").toMutableList()
                    if (infoList.containsAll(wordList)) {
                        isValueExist = true
                        return@forEach
                    }
                }
            } else {
                values.forEach {
                    it.linkList.forEach { it0 ->
                        var key = String(it0.privateKey)
                        var inputKey = info
                        if (link != "BTC") {
                            if (!key.startsWith("0x")) {
                                key = "0x$key"
                            }
                            if (!info.startsWith("0x")) {
                                inputKey = "0x$inputKey"
                            }
                        }
                        if (key == inputKey && it0.link == link) {
                            isValueExist = true
                            return@forEach
                        }
                    }
                }
            }
            isValueExist
        }
    }

    suspend fun deleteValue(id: Long) {
        withContext(Dispatchers.IO) {
            linkDao().deleteByValueId(id)
            valueDao().deleteById(id)
        }
    }

    suspend fun getValue(id: Long): LocalValueEntityNew? {
        return withContext(Dispatchers.IO) {
            setValue(id)
        }
    }

    suspend fun updateValueName(entity: ValueNameEntity) {
        withContext(Dispatchers.IO) {
            valueDao().updateValue(entity)
        }
    }

    suspend fun updateValuePassword(entity: ValuePasswordEntity) {
        withContext(Dispatchers.IO) {
            entity.password = AesUtil.Encrypt(String(entity.password)).toByteArray()
            if (VebZteKeyService.instance().isEnable())
                entity.password = VebZteKeyService.instance().service?.Encrypt(entity.password, Constants.INDEX_PWD) ?: byteArrayOf()
            valueDao().updateValuePassword(entity)
        }
    }


    suspend fun getAllValue(): List<LocalValueEntityNew> {
        return withContext(Dispatchers.IO) {
            val allValue = mutableListOf<LocalValueEntityNew>()
            valueDao().queryValueEntities().forEach {
                setValue(it.id)?.let { bean ->
                    allValue.add(bean)
                }
            }
            allValue
        }
    }

    suspend fun setValue(id: Long): LocalValueEntityNew? {
        return withContext(Dispatchers.IO) {
            valueDao().queryValueEntity(id)?.let { valueEntity ->
                var password = valueEntity.password
                var mnemonic = valueEntity.mnemonic
                if (VebZteKeyService.instance().isEnable()) {
                    password = VebZteKeyService.instance().service?.Decrypt(password, Constants.INDEX_PWD) ?: byteArrayOf()
                    mnemonic = VebZteKeyService.instance().service?.Decrypt(mnemonic, Constants.INDEX_MNEMONIC) ?: byteArrayOf()
                }
                password = AesUtil.Decrypt(String(password)).toByteArray()
                mnemonic = AesUtil.Decrypt(String(mnemonic)).toByteArray()
                val value = LocalValueEntityNew()
                value.id = valueEntity.id
                value.name = valueEntity.name
                value.password = String(password)
                value.mnemonic = String(mnemonic)
                value.isBackup = valueEntity.isBackup
                linkDao().queryLinkEntitiesByValueId(valueEntity.id).let { list ->
                    list.forEach {
                        if (VebZteKeyService.instance().isEnable()) {
                            it.privateKey = VebZteKeyService.instance().service?.Decrypt(it.privateKey, Constants.INDEX_PRIVATE_KEY) ?: byteArrayOf()
                            it.mnemonic = VebZteKeyService.instance().service?.Decrypt(it.mnemonic, Constants.INDEX_MNEMONIC) ?: byteArrayOf()
                        }
                        it.mnemonic = AesUtil.Decrypt(String(it.mnemonic)).toByteArray()
                        it.privateKey = AesUtil.Decrypt(String(it.privateKey)).toByteArray()
//                        Log.e("ValeDatabase", "解密后${String(it.privateKey)}")
                    }
                    value.linkList.addAll(list)
                }
                value
            }
        }
    }

    suspend fun addValueCurrency(link: LinkEntityNew) {
        withContext(Dispatchers.IO) {
            link.privateKey = AesUtil.Encrypt(String(link.privateKey)).toByteArray()
            link.mnemonic = AesUtil.Encrypt(String(link.mnemonic)).toByteArray()
            if (VebZteKeyService.instance().isEnable()) {
                link.privateKey = VebZteKeyService.instance().service?.Encrypt(link.privateKey, Constants.INDEX_PRIVATE_KEY) ?: byteArrayOf()
                link.mnemonic = VebZteKeyService.instance().service?.Encrypt(link.mnemonic, Constants.INDEX_MNEMONIC) ?: byteArrayOf()
            }
            linkDao().insertLinkEntity(link)
        }
    }

    suspend fun deleteCurrency(coinAddress: String, valueId: Long, channel: String) {
        withContext(Dispatchers.IO) {
            linkDao().deleteByCoinAddress(coinAddress, valueId, channel)
        }
    }


    @Transaction
    suspend fun insertValue(value: LocalValueEntityNew): Long {
        return withContext(Dispatchers.IO) {
            try {
                Log.e("ValeDatabase", "加密前${value.mnemonic}")
                var password = AesUtil.Encrypt(value.password).toByteArray()
                var mnemonic = AesUtil.Encrypt(value.mnemonic).toByteArray()
                Log.e("ValeDatabase", "step 1 加密后${String(mnemonic)}")
                if (VebZteKeyService.instance().isEnable()) {
                    password = VebZteKeyService.instance().service?.Encrypt(password, Constants.INDEX_PWD) ?: byteArrayOf()
                    mnemonic = VebZteKeyService.instance().service?.Encrypt(mnemonic, Constants.INDEX_MNEMONIC) ?: byteArrayOf()
                    Log.e("ValeDatabase", "step 2 加密后${String(mnemonic)}")
                }
                val id = valueDao().insertValueEntity(
                    ValueEntityNew(
                        id = value.id,
                        name = value.name,
                        password = password,
                        mnemonic = mnemonic,
                        isBackup = value.isBackup,
                    )
                )
                value.linkList.forEach {
                    it.privateKey = AesUtil.Encrypt(String(it.privateKey)).toByteArray()
                    it.mnemonic = AesUtil.Encrypt(String(it.mnemonic)).toByteArray()
                    if (VebZteKeyService.instance().isEnable()) {
                        val asd = VebZteKeyService.instance().service?.Test(123) ?: 999
                        ToastUtils.showShort(asd.toString())
                        it.privateKey = VebZteKeyService.instance().service?.Encrypt(it.privateKey, Constants.INDEX_PRIVATE_KEY) ?: byteArrayOf()
                        it.mnemonic = VebZteKeyService.instance().service?.Encrypt(it.mnemonic, Constants.INDEX_MNEMONIC) ?: byteArrayOf()
                    }
                    linkDao().insertLinkEntity(
                        LinkEntityNew(
                            id = it.id,
                            valueId = id,
                            link = it.link,
                            icon = it.icon,
                            mnemonic = it.mnemonic,
                            privateKey = it.privateKey,
                            address = it.address,
                            linkId = it.linkId,
                            fileName = it.fileName,
                            linkNumber = it.linkNumber,
                            linkPrice = it.linkPrice,
                            coinAddress = "",
                            isSelect = true,
                            channel = it.channel,
                            decimals = it.decimals

                        )
                    )
                }
                return@withContext id
            } catch (t: Throwable) {
                t.printStackTrace()
            }
            1L
        }
    }

    @Transaction
    suspend fun updateValueLink(valueId: Long, list: List<LinkEntityNew>) {
        return withContext(Dispatchers.IO) {
            try {
//                linkDao().deleteByValueId(valueId)
                list.forEach {
                    it.privateKey = AesUtil.Encrypt(String(it.privateKey)).toByteArray()
                    it.mnemonic = AesUtil.Encrypt(String(it.mnemonic)).toByteArray()
                    if (VebZteKeyService.instance().isEnable()) {
                        it.privateKey = VebZteKeyService.instance().service?.Encrypt(it.privateKey, Constants.INDEX_PRIVATE_KEY) ?: byteArrayOf()
                        it.mnemonic = VebZteKeyService.instance().service?.Encrypt(it.mnemonic, Constants.INDEX_MNEMONIC) ?: byteArrayOf()
                    }
                    linkDao().insertLinkEntity(
                        LinkEntityNew(
                            id = it.id,
                            valueId = valueId,
                            link = it.link,
                            icon = it.icon,
                            mnemonic = it.mnemonic,
                            privateKey = it.privateKey,
                            address = it.address,
                            linkId = it.linkId,
                            fileName = it.fileName,
                            linkNumber = it.linkNumber,
                            linkPrice = it.linkPrice,
                            coinAddress = "",
                            isSelect = true,
                            channel = ""
                        )
                    )
                }
            } catch (t: Throwable) {
                t.printStackTrace()
            }
            1L
        }
    }
}