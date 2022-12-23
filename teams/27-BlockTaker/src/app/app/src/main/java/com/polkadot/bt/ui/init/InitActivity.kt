package com.polkadot.bt.ui.init

import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.databinding.ActivityInitBinding
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.channel.ImportActivity
import com.polkadot.bt.ui.create.CreateWalletActivity
import splitties.activities.start

class InitActivity : BaseVBActivity<ActivityInitBinding>() {
    override fun initBinding() = ActivityInitBinding.inflate(layoutInflater)

    override fun init() {
        StatusBarUtil.setTranslucent(this, 0)
        StatusBarUtil.setDarkMode(this)
        initListeners()
    }

    private fun initListeners() {
        binding.clCreate.setOnClickListener {
            start<CreateWalletActivity>()
        }
        binding.clImport.setOnClickListener {
            start<ImportActivity>()
        }
    }
}