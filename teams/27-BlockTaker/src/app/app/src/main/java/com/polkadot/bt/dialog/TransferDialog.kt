package com.polkadot.bt.dialog

import android.content.Context
import android.view.View
import android.widget.TextView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.polkadot.bt.R
import com.polkadot.bt.custom.AppToolbar
import com.polkadot.bt.ext.clickNoRepeat
import com.polkadot.bt.ext.isSemiBold

/**
 * @author Heaven
 * @date 2022/8/8 13:51
 */
class TransferDialog(context: Context, money: String, paymentAddress: String, payeeAddress: String, absenteeismFee: String, remark: String, perform: () -> Unit) :
    BottomSheetDialog(context, R.style.MBottomSheetDialog) {


    init {
        val view = View.inflate(context, R.layout.transfer_dialog, null)
        val toolbar: AppToolbar = view.findViewById(R.id.toolbar)
        val moneyText: TextView = view.findViewById(R.id.money)
        val paymentAddressText: TextView = view.findViewById(R.id.payment_address)
        val payeeAddressText: TextView = view.findViewById(R.id.payee_address)
        val absenteeismFeeText: TextView = view.findViewById(R.id.absenteeism_fee)
        val remarkText: TextView = view.findViewById(R.id.remark)
        val determine: TextView = view.findViewById(R.id.determine)

        isSemiBold(moneyText, paymentAddressText, payeeAddressText, absenteeismFeeText, remarkText)

        toolbar.setMoreListener {
            dismiss()
        }

        moneyText.text = money
        paymentAddressText.text = paymentAddress
        payeeAddressText.text = payeeAddress
        absenteeismFeeText.text = absenteeismFee
        remarkText.text = remark

        determine.clickNoRepeat {
            cancel()
            perform.invoke()
        }

        setContentView(view)
        setCancelable(true)
        setCanceledOnTouchOutside(true)
    }
}