package com.polkadot.bt.ui.home

import com.polkadot.bt.databinding.ScanResultActivityBinding
import com.polkadot.bt.ext.copyToClipboard
import com.polkadot.bt.ext.isSemiBold
import com.polkadot.bt.ext.string
import com.polkadot.bt.ui.BaseActivity

/**
 * @author Heaven
 * @date 2022/8/9 11:48
 */
class ScanResultActivity : BaseActivity<ScanResultActivityBinding>() {

    override fun initBinding() = ScanResultActivityBinding.inflate(layoutInflater)

    override fun init() {
        isSemiBold(binding.copy, binding.content)
        binding.copy.setOnClickListener {
            copyToClipboard(this,binding.content.string())
        }

        val result = intent.getStringExtra("result")
        binding.content.text = result
    }
}