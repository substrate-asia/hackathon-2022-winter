package com.polkadot.bt.dialog

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.view.View
import android.widget.TextView
import com.polkadot.bt.R

@SuppressLint("SetTextI18n")
class TipsDialog(context: Context, content: String) : Dialog(context, R.style.MBottomSheetDialog) {

    init {
        val view = View.inflate(context, R.layout.dialog_tips, null)

        view.findViewById<TextView>(R.id.tvContent).text = content
        view.findViewById<TextView>(R.id.tvClose).setOnClickListener {
            dismiss()
        }
        setContentView(view)
        setCancelable(false)
        setCanceledOnTouchOutside(false)
    }
}