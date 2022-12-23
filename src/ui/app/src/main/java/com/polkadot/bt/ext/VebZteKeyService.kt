package com.polkadot.bt.ext

import android.annotation.SuppressLint
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.os.IBinder.DeathRecipient
import android.util.Log
import com.vertu.metaspace.VebZteKey


/**
 * @author Ncy
 * @created 2022/9/27
 * @description
 */
class VebZteKeyService : DeathRecipient, ServiceConnection {
    private var mService: VebZteKey? = null
    val pubKey = byteArrayOf(
        0x98.toByte(),
        0xD8.toByte(),
        0x35.toByte(),
        0x80.toByte(),
        0x38.toByte(),
        0x92.toByte(),
        0x34.toByte(),
        0x61.toByte(),
        0xBB.toByte(),
        0xF5.toByte(),
        0x0C.toByte(),
        0xC6.toByte(),
        0xFE.toByte(),
        0x18.toByte(),
        0x4A.toByte(),
        0xE6.toByte(),
        0x99.toByte(),
        0x00.toByte(),
        0xA0.toByte(),
        0x2A.toByte(),
        0xD0.toByte(),
        0x3D.toByte(),
        0x48.toByte(),
        0x56.toByte(),
        0x0E.toByte(),
        0x5B.toByte(),
        0xD0.toByte(),
        0x2A.toByte(),
        0xD0.toByte(),
        0x84.toByte(),
        0x05.toByte(),
        0xB0.toByte(),
        0x42.toByte(),
        0x69.toByte(),
        0x91.toByte(),
        0x05.toByte(),
        0x09.toByte(),
        0x6F.toByte(),
        0x2B.toByte(),
        0x5B.toByte(),
        0x33.toByte(),
        0x8D.toByte(),
        0x41.toByte(),
        0x85.toByte(),
        0x2A.toByte(),
        0x7E.toByte(),
        0x7C.toByte(),
        0xB1.toByte(),
        0xBE.toByte(),
        0xDF.toByte(),
        0x1E.toByte(),
        0x77.toByte(),
        0x3C.toByte(),
        0x0A.toByte(),
        0xF2.toByte(),
        0xD6.toByte(),
        0xE5.toByte(),
        0xB8.toByte(),
        0xC5.toByte(),
        0xA6.toByte(),
        0x93.toByte(),
        0xAE.toByte(),
        0xB8.toByte(),
        0x94.toByte()
    )

    val priKey = byteArrayOf(
        0x99.toByte(),
        0xA3.toByte(),
        0xC4.toByte(),
        0xF8.toByte(),
        0x43.toByte(),
        0xA2.toByte(),
        0xD3.toByte(),
        0x60.toByte(),
        0x00.toByte(),
        0xB3.toByte(),
        0x7E.toByte(),
        0x1B.toByte(),
        0x10.toByte(),
        0x1C.toByte(),
        0xF7.toByte(),
        0x2D.toByte(),
        0x77.toByte(),
        0x94.toByte(),
        0x08.toByte(),
        0x4F.toByte(),
        0xEE.toByte(),
        0x60.toByte(),
        0x29.toByte(),
        0xC5.toByte(),
        0xBC.toByte(),
        0x82.toByte(),
        0x5C.toByte(),
        0x91.toByte(),
        0x99.toByte(),
        0xB5.toByte(),
        0xE7.toByte(),
        0x71.toByte()
    )

    companion object {
        @SuppressLint("StaticFieldLeak")
        private var instance: VebZteKeyService? = null
        fun instance(): VebZteKeyService? {
            if (instance == null) {
                synchronized(VebZteKeyService::class.java) {
                    if (instance == null) {
                        instance = VebZteKeyService()
                    }
                }
            }
            return instance
        }
    }

    val service: VebZteKey?
        get() {
            return mService
        }

    fun init(context: Context) {
        Log.e("aidl", "bind  connect service")
        val intent = Intent(VebZteKey::class.java.name)
        intent.setPackage("com.vertu.metaspace")
        intent.action = "com.vertu.metaspace.RemoteService"
        try {
            context.bindService(intent, this, Context.BIND_AUTO_CREATE)
        } catch (e: Exception) {
            e.printStackTrace()
            onServiceDisconnected(null)
        }
    }

    override fun binderDied() {
        mService = null
    }

    override fun onServiceConnected(name: ComponentName, service: IBinder) {
        Log.e("aidl", "success")
        mService = VebZteKey.Stub.asInterface(service)

        try {
            val isImport = mService?.ImportKeyAll(pubKey, priKey, Constants.INDEX_OLD_PRIVATE_KEY)
            val text = "vertu123"
            Log.e("aidl", "导入：${isImport}")
            val encrypt = mService?.Encrypt(text.toByteArray(), Constants.INDEX_OLD_PRIVATE_KEY)
            Log.e("aidl", "加密后：${String(encrypt!!)}")
            Log.e("aidl", "解密后：${String(mService?.Decrypt(encrypt, Constants.INDEX_OLD_PRIVATE_KEY)!!)}")

        } catch (e: Exception) {
            Log.e("e", e.message.toString())
        }
    }

    override fun onServiceDisconnected(name: ComponentName?) {
        Log.e("aidl", "failed")
        mService = null
    }
}