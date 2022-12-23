package com.polkadot.bt.dialog

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.view.View
import android.widget.TextView
import androidx.appcompat.widget.AppCompatImageView
import androidx.constraintlayout.widget.ConstraintLayout
import com.polkadot.bt.R
import com.polkadot.bt.ext.*
import splitties.views.imageDrawable


/**
 * @author Heaven
 * @date 2022/8/5 15:12
 */
@SuppressLint("SetTextI18n")
class ShareDialog(context: Context, drawable: Drawable, addressText: String, share: (Bitmap) -> Unit) : Dialog(context, R.style.MBottomSheetDialog) {

    init {
        val view = View.inflate(context, R.layout.share_dialog, null)
        val code: AppCompatImageView = view.findViewById(R.id.code)
        val address: TextView = view.findViewById(R.id.address)
        val cancel: TextView = view.findViewById(R.id.cancel)
        val shareBtn: TextView = view.findViewById(R.id.share)
        val shareView: ConstraintLayout =view.findViewById(R.id.share_view)

        shareBtn.isSemiBold()
        cancel.isSemiBold()

        code.imageDrawable = drawable
        address.text = addressText


        shareBtn.setOnClickListener {
            dismiss()
            share.invoke(getViewToBitmap(shareView)!!)
        }

        cancel.setOnClickListener { dismiss() }

        setContentView(view)
        setCancelable(true)
        setCanceledOnTouchOutside(true)
    }

    override fun show() {
        super.show()
        val params = window?.attributes
        params?.width = screenWidth
        params?.height = screenHeight
        window?.attributes = params
    }
}