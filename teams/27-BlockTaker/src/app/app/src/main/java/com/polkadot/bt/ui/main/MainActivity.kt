package com.polkadot.bt.ui.main

import android.view.Gravity
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityMainBinding
import com.polkadot.bt.dialog.TipsDialog
import com.polkadot.bt.ext.AppManager
import com.polkadot.bt.ext.VebZteKeyService
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
        if (!VebZteKeyService.instance().isEnable()) {
            TipsDialog(this, "检测到当前钱包没有加密芯片保护私钥，但不影响钱包的使用，在使用钱包过程中请注意保护私钥安全，切勿将私钥泄露").show()
        }
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