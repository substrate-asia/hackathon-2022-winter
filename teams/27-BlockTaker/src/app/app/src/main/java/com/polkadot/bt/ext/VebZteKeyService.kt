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

class VebZteKeyService : DeathRecipient, ServiceConnection {
    private var mService: VebZteKey? = null

    companion object {
        const val TAG = "VebZteKeyService"

        @SuppressLint("StaticFieldLeak")
        private var instance: VebZteKeyService? = null
        fun instance(): VebZteKeyService {
            if (instance == null) {
                synchronized(VebZteKeyService::class.java) {
                    if (instance == null) {
                        instance = VebZteKeyService()
                    }
                }
            }
            return instance!!
        }
    }

    val service: VebZteKey?
        get() {
            return mService
        }

    fun init(context: Context) {
        Log.e(TAG, "bind  connect service")
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
        Log.e(TAG, "Service Connected")
        mService = VebZteKey.Stub.asInterface(service)
        try {
            val testText = "When grace is lost from life, come with a burst of song"
            val encrypt = mService?.Encrypt(testText.toByteArray(), Constants.INDEX_PRIVATE_KEY)
            Log.e(TAG, "encrypted：${String(encrypt!!)}")
            Log.e(TAG, "decrypted：${String(mService?.Decrypt(encrypt, Constants.INDEX_PRIVATE_KEY)!!)}")
        } catch (e: Exception) {
            Log.e(TAG, e.message.toString())
        }
    }

    override fun onServiceDisconnected(name: ComponentName?) {
        Log.e(TAG, "failed")
        mService = null
    }

    fun isEnable(): Boolean = service != null
}