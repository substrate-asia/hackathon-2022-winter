package com.polkadot.bt.ui.init

import android.content.Intent
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityMetaInitBinding
import com.polkadot.bt.ext.AppManager
import com.polkadot.bt.ext.Utils
import com.polkadot.bt.ext.VebZteKeyService
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.channel.ImportActivity
import com.polkadot.bt.ui.create.CreateWalletActivity

class MetaInitActivity : BaseVBActivity<ActivityMetaInitBinding>() {
    override fun initBinding() = ActivityMetaInitBinding.inflate(layoutInflater)

    override fun init() {
        VebZteKeyService.instance()?.init(this)
        val language = Utils.getSystemLanguage(true)
        binding.ivTop.setBackgroundResource(
            if (language == "zh-cn")
                R.drawable.meta_bg
            else if (language.startsWith("zh"))
                R.drawable.meta_bg_tw
            else
                R.drawable.meta_bg_en
        )
        initListeners()
    }

    private fun initListeners() {
        binding.llCreate.setOnClickListener {
            startActivity(Intent(this, CreateWalletActivity::class.java)
                .putExtra("isFromMetaSpace", true)
            )
        }
        binding.llImport.setOnClickListener {
            startActivity(Intent(this, ImportActivity::class.java)
                .putExtra("isFromMetaSpace", true)
            )
        }
        binding.tvJump.setOnClickListener {
            val intent = Intent()
            intent.setClassName("com.vertu.metaspace","com.vertu.metaspace.main.activity.VerifyDialCodeActivity")
            startActivity(intent)
            AppManager.getInstance().exit()
        }
    }
}