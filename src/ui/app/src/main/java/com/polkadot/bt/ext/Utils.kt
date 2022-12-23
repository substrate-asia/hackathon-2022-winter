package com.polkadot.bt.ext

import android.annotation.SuppressLint
import android.content.Context
import android.hardware.biometrics.BiometricPrompt
import android.hardware.biometrics.BiometricPrompt.AuthenticationCallback
import android.net.ConnectivityManager
import android.net.NetworkInfo
import android.net.Uri
import android.os.Build
import android.os.CancellationSignal
import android.os.LocaleList
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.biometric.BiometricManager
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.R
import java.util.*


/**
 * created  by will on 2021/12/22 16:04
 */
object Utils {
    private var sn = ""

    fun getDeviceRelatedParamMap(context: Context): Map<String, String> {
        val params = HashMap<String, String>()
        params.putAll(getDeviceRelatedParamMapEight(context))
        val imeis = getImei(context)
        try {
            Collections.sort<String>(imeis)
            for (slot in imeis.indices) {
                if (slot == 0) {
                    params["imei"] = imeis.get(slot)
                } else {
                    params["imei2"] = imeis.get(slot)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        params["sn"] = sn
        return params
    }


    fun getDeviceRelatedParamMapEight(context: Context): Map<String, String> {
        val params = HashMap<String, String>()
        params["app"] = BuildConfig.VERSION_NAME
        params["rom"] = Build.VERSION.RELEASE
        params["code"] = "" + BuildConfig.VERSION_CODE
        params["mod"] = Build.MODEL
        params["sys"] = "Android"
        params["lng"] = Locale.getDefault().toString()
        params["mf"] = Build.MANUFACTURER
        params["pg"] = BuildConfig.APPLICATION_ID
        return params
    }

    @SuppressLint("Range")
    open fun getImei(context: Context): ArrayList<String> {
        val imeis = ArrayList<String>()
        val cursor = context.contentResolver.query(
            Uri.parse("content://com.vertu.findmyvertu.metadata/device_id"),
            null,
            null,
            null,
            null
        )
        while (cursor?.moveToNext() == true) {
            imeis.add(cursor.getString(cursor.getColumnIndex("imei")))
            sn = cursor.getString(cursor.getColumnIndex("sn")) ?: ""
        }
        cursor?.close()
        return imeis
    }

    fun getSystemLanguage(toLowerCase: Boolean): String {
        val locale = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N)
            LocaleList.getDefault()[0]
        else
            Locale.getDefault()
        val language = locale.language + "-" + locale.country
        return if (toLowerCase) {
            language.toLowerCase(Locale.ENGLISH)
        } else {
            language
        }
    }

    fun getCorp(): String {
        val language = MySharedPreferences.get("language", getSystemLanguage(true))
        return if (language == "zh-cn")
            "device-cn"
        else if (language.startsWith("zh"))
            "device-mo"
        else
            "device-en"
    }

    fun getDeviceModel(): String {
        return Build.MODEL
    }

    fun isMeta(): Boolean {
        val mtype = Build.MODEL // 手机型号
        val mtyb = Build.BRAND//手机品牌
//        return "$mtyb&$mtype" == "VERTU&VTL-202201"
        return false
    }

    /*
    * 判断网络状态
    * */
     fun isNetworkConnected(context: Context?): Boolean {
        if (context != null) {
            val mConnectivityManager = context
                .getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val mNetworkInfo: NetworkInfo? = mConnectivityManager.activeNetworkInfo
            if (mNetworkInfo != null) {
                return mNetworkInfo.isAvailable
            }
        }
        return false
    }

    /**
     * 是否支持指纹
     */
    fun isHardwareAvailable(context: Context): Boolean{
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
            val bm = BiometricManager.from(context)
            val canAuthenticate = bm.canAuthenticate()
            !(canAuthenticate == BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE || canAuthenticate == BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE)

        } else {
            false
        }
    }

    /**
     * 是否有指纹
     */
    fun hasBiometricEnrolled(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
            val bm = BiometricManager.from(context)
            val canAuthenticate = bm.canAuthenticate()
            (canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS)
        } else {
            false
        }
    }

    /**
     * 指纹解锁
     */
    @RequiresApi(Build.VERSION_CODES.P)
    fun useFingerprint(context: Context, callback: AuthenticationCallback) {
        val mBiometricPrompt: BiometricPrompt?
        val mCancellationSignal: CancellationSignal?
        val log = "fingerprint"

        mBiometricPrompt = BiometricPrompt.Builder(context)
            .setTitle(context.getString(R.string.fingerprint_verification))
//            .setDescription("描述")
            .setNegativeButton(context.getString(R.string.cancel), context.mainExecutor) { _, _ ->
                Log.i(log, "Cancel button clicked")
            }
            .build()

        mCancellationSignal = CancellationSignal()
        mCancellationSignal.setOnCancelListener(CancellationSignal.OnCancelListener {
            // 取消
            Log.i(log, "Canceled")
        })

        mBiometricPrompt.authenticate(
            mCancellationSignal,
            context.mainExecutor,
            callback
        )
    }
}