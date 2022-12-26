package com.polkadot.bt.ui.main

import android.view.Gravity
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityMainBinding
import com.polkadot.bt.ext.AppManager
import com.polkadot.bt.ext.toast
import com.polkadot.bt.module.wallet_connect.WCController
import com.polkadot.bt.ui.BaseActivity

class MainActivity : BaseActivity<ActivityMainBinding>() {

    private val mainPageController by lazy { MainPageController(supportFragmentManager, R.id.container) }
    private var time = 0L
    override fun initBinding() = ActivityMainBinding.inflate(layoutInflater)
    override fun init() {
        mainPageController.init()
        mainPageController.setupWithBottomNavigation(binding.navigationView)
    }
    override fun onBackPressed() {
        if (System.currentTimeMillis() - time > 2000 && WCController.wcClient.isConnected) {
            toast(getString(R.string.already_connect), Gravity.BOTTOM)
            time = System.currentTimeMillis()
        } else {
            AppManager.getInstance().finishAllActivity()
            finish()
        }
    }
}