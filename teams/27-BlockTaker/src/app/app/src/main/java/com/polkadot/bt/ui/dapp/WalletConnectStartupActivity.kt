package com.polkadot.bt.ui.dapp

import android.os.Handler
import android.os.Looper
import androidx.lifecycle.lifecycleScope
import com.blankj.utilcode.util.ToastUtils
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityWalletConnectStartupBinding
import com.polkadot.bt.dialog.WaitDialog
import com.polkadot.bt.ext.ActivityManager
import com.polkadot.bt.module.wallet_connect.TimeoutCallback
import com.polkadot.bt.module.wallet_connect.WCController
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.main.MainActivity
import com.polkadot.bt.ui.splash.LauncherActivity
import kotlinx.coroutines.launch
import splitties.activities.start
import splitties.toast.toast

class WalletConnectStartupActivity : BaseActivity<ActivityWalletConnectStartupBinding>() {

    override fun initBinding(): ActivityWalletConnectStartupBinding = ActivityWalletConnectStartupBinding.inflate(layoutInflater)

    override fun init() {
        lifecycleScope.launch {
            if (!ValueDatabaseNew.get(this@WalletConnectStartupActivity).getAllValue().isEmpty()) {
                if (ActivityManager.getMainActivity() == null)
                    start<MainActivity>()
                if (intent.dataString!!.contains("bridge")) {
                    Handler(Looper.getMainLooper()).postDelayed({
                        WCController.connect(intent.dataString!!, 1, object : TimeoutCallback{
                            override fun timeout() {
                                WaitDialog.dismiss()
                                WCController.disConnect()
                                toast(this@WalletConnectStartupActivity.getString(R.string.connect_timeout))
                            }
                        })
                    }, 100)
                }
            } else {
                ToastUtils.showLong("Wallet has not been created yet")
                start<LauncherActivity>()
            }
            finish()
        }

    }
}