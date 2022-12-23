package com.polkadot.bt.ui.create

import android.content.Intent
import android.view.View
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityCreateSuccessBinding
import com.polkadot.bt.ext.AppManager
import com.polkadot.bt.ext.Constants
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.backup.BackupMnemonicActivity
import com.polkadot.bt.ui.main.MainActivity
import splitties.activities.start

class CreateSuccessActivity : BaseVBActivity<ActivityCreateSuccessBinding>() {
    override fun initBinding() = ActivityCreateSuccessBinding.inflate(layoutInflater)

    override fun init() {
        val isFromMetaSpace = intent.getBooleanExtra("isFromMetaSpace", false)
        binding.baseTitle.tvTitle.text = getString(R.string.init_create)
        binding.baseTitle.ivBack.visibility= View.GONE
        binding.tvNow.setOnClickListener {
            val valueId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
            startActivity(
                Intent(this, BackupMnemonicActivity::class.java)
                    .putExtra("isFromMetaSpace", isFromMetaSpace)
                    .putExtra("id",valueId)
            )
        }
        binding.tvLater.setOnClickListener {
            if (isFromMetaSpace) {
                //跳转myvertu
                val intent = Intent()
                intent.setClassName("com.vertu.life2","com.vertu.myvertu.activity.WelcomeActivity")
                intent.putExtra("isFromMetaSpace", isFromMetaSpace)
                startActivity(intent)
                AppManager.getInstance().exit0()
            } else{
                start<MainActivity>()
                AppManager.getInstance().finishALlActivityExceptClassName(MainActivity::class.java)
            }
//            finish()
        }
    }

    override fun onBackPressed() {
//        super.onBackPressed()
    }
}