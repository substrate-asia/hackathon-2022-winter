package com.polkadot.bt.ui.stake

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.view.Gravity
import android.view.LayoutInflater
import com.polkadot.bt.R
import com.polkadot.bt.databinding.DialogStakeIn1Binding
import com.polkadot.bt.databinding.DialogStakeOutBinding
import com.polkadot.bt.ext.screenWidth
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date

@SuppressLint("SetTextI18n")
class StakeOutDialog(context: Context, amount: String,gas: String, onConfirmClick: () -> Unit) : Dialog(context, R.style.MBottomSheetDialog) {
    init {
        val binding = DialogStakeOutBinding.inflate(LayoutInflater.from(context))
        binding.tvBlance.text = amount + " DOT"
        binding.tvGas.text = gas
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_YEAR,28)
        binding.tvDate.text = SimpleDateFormat("yyyy-MM-dd").format(Date(calendar.timeInMillis))
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