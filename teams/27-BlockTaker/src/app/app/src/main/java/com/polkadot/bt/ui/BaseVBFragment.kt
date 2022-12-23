package com.polkadot.bt.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.viewbinding.ViewBinding

abstract class BaseVBFragment<VB : ViewBinding> : Fragment() {

    private var _container: ViewGroup? = null
    private var _bind: VB? = null

    val binding: VB
        get() {
            if (_bind == null) {
                _bind = initBinding(_container)
            }
            return _bind!!
        }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        _container = container
        _bind = initBinding(container)
        init()
        return _bind?.root
    }


    /**
     * Bind Layout
     *
     * @return Layout bind to [android.app.Activity]
     */
    abstract fun initBinding(container: ViewGroup?): VB

    abstract fun init()

    override fun onDestroyView() {
        super.onDestroyView()
        _bind = null
    }
}
