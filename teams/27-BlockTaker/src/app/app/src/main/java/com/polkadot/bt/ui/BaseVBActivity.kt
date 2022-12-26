package com.polkadot.bt.ui

import android.os.Bundle
import androidx.viewbinding.ViewBinding
import com.polkadot.bt.ext.AppManager

/**
 * @author Heaven
 * @date 2022/8/3 16:51
 */
abstract class BaseVBActivity<VB : ViewBinding> : BaseSettingActivity() {

    private var _bind: VB? = null

    val binding: VB
        get() {
            if (_bind == null) {
                _bind = initBinding()
            }
            return _bind!!
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AppManager.getInstance().addActivity(this)
        _bind = initBinding()
        setContentView(binding.root)
        init()
    }

    /**
     * Bind Layout
     *
     * @return Layout bind to [android.app.Activity]
     */
    abstract fun initBinding(): VB

    abstract fun init()

    override fun onDestroy() {
        super.onDestroy()
        AppManager.getInstance().removeActivity(this)
        _bind = null
    }
}
