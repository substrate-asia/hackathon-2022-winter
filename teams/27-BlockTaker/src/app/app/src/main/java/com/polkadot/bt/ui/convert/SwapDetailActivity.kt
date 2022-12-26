package com.polkadot.bt.ui.convert

import android.view.ViewGroup
import com.blankj.utilcode.util.BarUtils
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.databinding.SwapDetailActivityBinding
import com.polkadot.bt.ext.copyToClipboard
import com.polkadot.bt.ext.transDate
import com.polkadot.bt.room.entities.SwapEntity
import com.polkadot.bt.ui.BaseActivity

class SwapDetailActivity :BaseActivity<SwapDetailActivityBinding>() {
    override fun initBinding()=SwapDetailActivityBinding.inflate(layoutInflater)


    override fun init() {
        StatusBarUtil.setDarkMode(this)
        BarUtils.transparentStatusBar(this)
        (binding.ivBack.layoutParams as ViewGroup.MarginLayoutParams).topMargin = StatusBarUtil.getStatusBarHeight(this)
        binding.ivBack.setOnClickListener { finish() }

        val swap=intent.getSerializableExtra("swap") as SwapEntity
        binding.transferOut.setContentText("${swap.fromTokenAmount} ${swap.fromSymbol}")
        binding.transferIn.setContentText("${swap.toTokenAmount} ${swap.toSymbol}")
        binding.transferRate.setContentText("1 : ${swap.fromTokenAmount.toDouble()/swap.toTokenAmount.toDouble()}")
        binding.payeeAddress.setContentText(swap.from)
        binding.paymentAddress.setContentText(swap.to)
        binding.time.setContentText(transDate(swap.time))
        binding.real.setContentText("${swap.value} ${swap.fromSymbol}")

        binding.payeeAddress.setRightListener {
            copyToClipboard(this,binding.payeeAddress.getContentText())
        }
        binding.paymentAddress.setRightListener {
            copyToClipboard(this,binding.paymentAddress.getContentText())
        }
        binding.hash.setRightListener {
            copyToClipboard(this,binding.hash.getContentText())
        }

    }
}