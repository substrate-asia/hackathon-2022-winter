package com.polkadot.bt.ui

import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.Display
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.ext.LanguageUtil
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ext.Utils
import com.polkadot.bt.ui.channel.ImportActivity
import kotlinx.coroutines.launch
import java.util.*

/**
 * @author Heaven
 * @date 2022/8/3 16:50
 */
open class BaseSettingActivity : AppCompatActivity() {

    private var modes: Array<Display.Mode>? = null

    fun getModeSize(): Int {
        return modes?.size ?: 1
    }

    /**
     * 选择屏幕刷新率，从 [0] 开始，如果超出手机屏幕可调范围，则默认为 [0] 。
     */
    var refreshRate = 0
        set(value) {
            field = if (value >= 0 && value < (modes?.size ?: 0)) {
                value
            } else {
                0
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        StatusBarUtil.setLightMode(this)
        StatusBarUtil.setTranslucent(this, 0)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            modes = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                display?.supportedModes
            } else {
                window.windowManager.defaultDisplay.supportedModes
            }
            modes?.let {
                Arrays.sort(it) { o1, o2 ->
                    if (o1.refreshRate - o2.refreshRate > 0) {
                        return@sort -1
                    }
                    return@sort 0
                }
                val lp = window.attributes
                lp.preferredDisplayModeId = it[refreshRate].modeId
                window.attributes = lp
            }
        }
    }

    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        if (ev.action == MotionEvent.ACTION_DOWN && this !is ImportActivity) {
            val view = currentFocus
            if (view is EditText) {
                val leftTop = intArrayOf(0, 0)
                view.getLocationInWindow(leftTop)
                val left = leftTop[0]
                val top = leftTop[1]
                val bottom = top + view.getHeight()
                val right = left + view.getWidth()
                if (!(ev.x > left && ev.x < right && ev.y > top && ev.y < bottom)) {
                    val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                    imm.hideSoftInputFromWindow(view.windowToken, InputMethodManager.HIDE_NOT_ALWAYS)
                    view.clearFocus()
                }
            }
        }
        return super.dispatchTouchEvent(ev)
    }

    /*
    * 语言切换
    * */
    override fun attachBaseContext(newBase: Context) {
        lifecycleScope.launch {

            val language=MySharedPreferences.get("language",Utils.getSystemLanguage(true))
            super.attachBaseContext(LanguageUtil.attachBaseContext(newBase,language))
        }

    }

}