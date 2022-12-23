package com.polkadot.bt.ui.home

import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.widget.AppCompatImageView
import com.google.zxing.Result
import com.king.zxing.CameraScan
import com.king.zxing.CaptureActivity
import com.king.zxing.util.CodeUtils
import com.polkadot.bt.R
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.ext.Constants
import com.polkadot.bt.ext.selectPhoto
import splitties.activities.start

/**
 * @author Heaven
 * @date 2022/8/9 16:18
 */
class ScanActivity : CaptureActivity(), CameraScan.OnScanResultCallback {

    companion object {
        const val ACTION_TEXT = "ACTION_TEXT"
        const val ACTION_TRANSFER = "ACTION_TRANSFER"
        const val ACTION_SEARCH = "ACTION_SEARCH"
        const val OUT_PARAM_SEARCH_RESULT = "OUT_PARAM_SEARCH_RESULT"
        fun start(context: Context, action: String = ACTION_TEXT) {
            context.startActivity(Intent(context, ScanActivity::class.java).apply { this.action = action })
        }
    }

    override fun getLayoutId(): Int {
        return R.layout.scan_activity
    }

    override fun getFlashlightId(): Int {
        return 0
    }

    override fun onScanResultCallback(result: Result?): Boolean {
        result?.let { handleScanResult(it.text) }
        return false
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        StatusBarUtil.setDarkMode(this)
        StatusBarUtil.setTranslucent(this, 0)
        super.onCreate(savedInstanceState)
        if (intent.action == ACTION_SEARCH) {
            val tips: TextView = findViewById(R.id.tips)
            tips.text = resources.getString(R.string.put_qr_into_box)
        }
        val close: AppCompatImageView = findViewById(R.id.close)
        close.setOnClickListener { finish() }
        val album: TextView = findViewById(R.id.album)
        val launcher = selectPhoto {
//            val bitmap = getBitmapFormUri(this, it)
            it?.let {
                val bitmap = BitmapFactory.decodeStream(contentResolver.openInputStream(it))
                bitmap?.let {
                    val result = CodeUtils.parseCode(bitmap)
                    handleScanResult(result)
                }
            }
        }
        album.setOnClickListener {
            launcher.launch(null)
        }
    }

    fun handleScanResult(result: String) {
        when (intent.action) {
            ACTION_TEXT -> {
                start<ScanResultActivity> {
                    putExtra("result", result)
                }
            }
            ACTION_TRANSFER -> {
                setResult(Constants.SCAN_RESULT, Intent().putExtra("address", result))
                finish()
            }
            ACTION_SEARCH -> {
                setResult(Constants.SCAN_RESULT, Intent().putExtra(OUT_PARAM_SEARCH_RESULT, result))
                finish()
            }
        }
    }
}