package com.polkadot.bt.ui

import android.os.Bundle
import androidx.viewbinding.ViewBinding
import com.polkadot.bt.ext.i

/**
 * @author Heaven
 * @date 2022/8/3 16:52
 */
abstract class BaseActivity<VB : ViewBinding> : BaseVBActivity<VB>() {

    companion object {

        val TAG: String by lazy { this::class.java.simpleName }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        "Create ${BaseFragment.TAG}".i(BaseFragment.TAG)
        super.onCreate(savedInstanceState)
    }

    override fun init() {

    }
}