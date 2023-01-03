package com.polkadot.bt.ui.stake

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.view.Gravity
import android.view.LayoutInflater
import com.polkadot.bt.R
import com.polkadot.bt.databinding.DialogStakeIn1Binding
import com.polkadot.bt.ext.screenWidth

@SuppressLint("SetTextI18n")
class StakeIn1Dialog(context: Context, address: String, contract: String, amount: String, gas: String, onConfirmClick: () -> Unit) : Dialog(context, R.style.MBottomSheetDialog) {
    init {
        val binding = DialogStakeIn1Binding.inflate(LayoutInflater.from(context))
        binding.tvAddress.text = address
        binding.tvContract.text = contract
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