package com.polkadot.bt.ui

import android.os.Bundle
import androidx.viewbinding.ViewBinding
import com.polkadot.bt.ext.i

/**
 * @author Heaven
 * @date 2022/8/4 11:06
 */
abstract class BaseFragment<VB : ViewBinding> : BaseVBFragment<VB>() {

    companion object {

        val TAG: String by lazy { this::class.java.simpleName }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        "Create $TAG".i(TAG)
    }

    override fun init() {

    }
}