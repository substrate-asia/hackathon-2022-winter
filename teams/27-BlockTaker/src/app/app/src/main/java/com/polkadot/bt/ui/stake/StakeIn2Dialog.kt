package com.polkadot.bt.ui.stake

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.view.Gravity
import android.view.LayoutInflater
import com.polkadot.bt.R
import com.polkadot.bt.databinding.DialogStakeIn2Binding
import com.polkadot.bt.ext.screenWidth

@SuppressLint("SetTextI18n")
class StakeIn2Dialog(context: Context, address: String, amount: String, gas: String, onConfirmClick: () -> Unit) : Dialog(context, R.style.MBottomSheetDialog) {
    init {
        val binding = DialogStakeIn2Binding.inflate(LayoutInflater.from(context))
        binding.tvAddress.text = address
        binding.tvAmount.text = amount
        binding.tvGas.text = gas
        binding.ivClose.setOnClickListener { dismiss() }
        binding.tvComfirm.setOnClickListener {
            dismiss()
            onConfirmClick.invoke()
        }

        setContentView(binding.root)

        initData()
        setCancelable(false)
        setCanceledOnTouchOutside(true)
    }

    private fun initData() {


    }

    override fun show() {
        super.show()
        val params = window?.attributes
        params?.width = screenWidth
        params?.gravity = Gravity.BOTTOM
        window?.attributes = params
    }
}