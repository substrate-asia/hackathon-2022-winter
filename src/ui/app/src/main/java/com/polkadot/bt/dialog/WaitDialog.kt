package com.polkadot.bt.dialog

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import androidx.appcompat.app.AlertDialog
import com.polkadot.bt.R
import com.polkadot.bt.ext.ActivityManager

object WaitDialog {

    private var instance: AlertDialog? = null

    fun showRound(): AlertDialog? = ActivityManager.getCurrentActivity()?.let {
        AlertDialog.Builder(it).create().apply {
            window?.run {
                // 设置背景透明,去四个角
                setLayout(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                // 设置固定宽带，高度自适应
                setBackgroundDrawableResource(R.color.color_transparent)
            }
            // 设置点击dialog的外部能否取消弹窗
            setCanceledOnTouchOutside(false)
            // 设置能不能返回键取消弹窗
            setCancelable(false)
            show()
            setContentView(
                View.inflate(it, R.layout.alert_dialog_round, null).apply {
                    // 设置成顶层视图
                    bringToFront()
                }
            )
            instance = this
        }
    }

    fun dismiss() {
        instance?.let {
            it.dismiss()
        }
    }
}

class LoadingDialog(context: Context) : Dialog(context, R.style.LoadingDialogStyle) {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setCancelable(false)
        setContentView(layoutInflater.inflate(R.layout.alert_dialog_round, null))
        window!!.run {
            val attr = attributes
            //如果设置背景透明无效，可以加上这行代码
            attr.format = PixelFormat.TRANSPARENT
            //设置背景透明
            setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            attributes = attr
        }
    }
}