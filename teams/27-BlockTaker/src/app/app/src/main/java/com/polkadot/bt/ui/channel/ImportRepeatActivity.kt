package com.polkadot.bt.ui.channel

import com.polkadot.bt.databinding.ActivityImportRepeatBinding
import com.polkadot.bt.ui.BaseVBActivity

class ImportRepeatActivity : BaseVBActivity<ActivityImportRepeatBinding>() {
    override fun initBinding() = ActivityImportRepeatBinding.inflate(layoutInflater)

    override fun init() {
//        binding.baseTitle.tvTitle.text = ""
        initListeners()
    }

    private fun initListeners() {
        binding.baseTitle.ivBack.setOnClickListener {
            finish()
        }
        binding.tvImport.setOnClickListener {
            finish()
        }
    }
}