package com.polkadot.bt.dialog

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.view.View
import android.widget.TextView
import com.polkadot.bt.R
import com.polkadot.bt.ext.isSemiBold

/**
 * @author Heaven
 * @date 2022/8/5 15:12
 */
@SuppressLint("SetTextI18n")
class NormalDialog private constructor(context: Context, titleText: String = "", contentText: String = "", cancelText: String = "", confirmText: String = "", cancelClick: (() -> Unit)?, confirmClick: (() -> Unit)?) :
    Dialog(context, R.style.MBottomSheetDialog) {

    init {
        val view = View.inflate(context, R.layout.normal_dialog, null)
        val cancel: TextView = view.findViewById(R.id.cancel)
        val confirm: TextView = view.findViewById(R.id.confirm)
        val title: TextView = view.findViewById(R.id.title)
        val content: TextView = view.findViewById(R.id.content)

        title.isSemiBold()
        title.text = titleText.ifEmpty { context.getString(R.string.safe_tips) }
        content.text = contentText.ifEmpty { context.getString(R.string.safe_tips_detail) }
        cancel.text = cancelText.ifEmpty { context.getString(R.string.cancel) }
        confirm.text = confirmText.ifEmpty { context.getString(R.string.confirm) }

        cancel.setOnClickListener {
            dismiss()
            cancelClick?.invoke()
        }
        confirm.setOnClickListener {
            dismiss()
            confirmClick?.invoke()
        }

        setContentView(view)
        setCancelable(true)
        setCanceledOnTouchOutside(true)
    }

    companion object {

        inline fun build(context: Context, block: Builder.() -> Unit) = Builder(context).apply(block).build()
    }

    class Builder(val context: Context) {
        var titleText: String = ""
        var contentText: String = ""
        var cancelText: String = ""
        var confirmText: String = ""
        var cancelClick: (() -> Unit)? = null
        var confirmClick: (() -> Unit)? = null

        fun build() = NormalDialog(context, titleText, contentText, cancelText, confirmText, cancelClick, confirmClick)
    }
}