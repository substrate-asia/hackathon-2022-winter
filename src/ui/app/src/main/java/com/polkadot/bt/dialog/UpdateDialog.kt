package com.polkadot.bt.dialog

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.view.View
import android.widget.TextView
import androidx.core.content.FileProvider
import com.polkadot.bt.R
import com.polkadot.bt.bean.UpgradeBean
import com.polkadot.bt.ext.isSemiBold
import com.polkadot.bt.net.HttpUtils
import kotlinx.coroutines.Job
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import java.io.File

/**
 * @author Heaven
 * @date 2022/8/5 15:12
 */
@SuppressLint("SetTextI18n")
class UpdateDialog(context: Context,  private val upgradeBean: UpgradeBean) : Dialog(context, R.style.MBottomSheetDialog) {
    private var mDismissListener: (() -> Unit)? = null
    private var downloadHandler: Job? = null
    private var downloadedFile: File? = null
    private var cancel: TextView? = null
    private var confirm: TextView? = null
    init {
        val view = View.inflate(context, R.layout.update_dialog, null)
        cancel = view.findViewById(R.id.cancel)
        cancel?.visibility = if (upgradeBean.force != 1) View.VISIBLE else View.GONE
        cancel?.setOnClickListener {
            dismiss()
            mDismissListener?.invoke()
        }
        confirm = view.findViewById(R.id.confirm)
        confirm?.setOnClickListener {
            cancel?.isEnabled = false
            confirm?.isEnabled = false
            if (downloadHandler == null)
                download()
            else
                downloadedFile?.let { install(it) }
        }
        val updateVersion: TextView = view.findViewById(R.id.version)
        updateVersion.isSemiBold()
        updateVersion.text = "${context.getString(R.string.update_version)} ${upgradeBean.version}"
        val content: TextView = view.findViewById(R.id.update_content)
        content.text = upgradeBean.desc

        setContentView(view)
        setCancelable(upgradeBean.force != 1)
        setCanceledOnTouchOutside(false)
    }

    @SuppressLint("SetTextI18n", "StringFormatMatches")
    private fun download() {
        downloadHandler = HttpUtils.downloadFile(upgradeBean.host + upgradeBean.file, "_update.apk") { _, downloadedLen, totalLen, file ->
            confirm?.post {
                if (downloadedLen == -1L) {
                    downloadHandler = null
                } else {
                    confirm?.text = context.getString(R.string.updating, downloadedLen * 100 / totalLen).also {
                        if (it.endsWith("100%")) {
                            cancel?.isEnabled = true
                            confirm?.isEnabled = true
                            MainScope().launch {
                                confirm?.text = context.getString(R.string.install)
                            }
                            downloadedFile = file
                            install(file!!)
                        }
                    }
                }
            }
        }
    }

    fun show(dismissListener: (() -> Unit)? = null) {
        mDismissListener = dismissListener
        super.show()
    }

    private fun install(file: File) {
        val intent = Intent(Intent.ACTION_VIEW)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            intent.flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
            val contentUri = FileProvider.getUriForFile(context, context.packageName + ".fileprovider", file)
            intent.setDataAndType(contentUri, "application/vnd.android.package-archive")
        } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            intent.setDataAndType(Uri.fromFile(file), "application/vnd.android.package-archive")
        }
        context.startActivity(intent)
    }
}