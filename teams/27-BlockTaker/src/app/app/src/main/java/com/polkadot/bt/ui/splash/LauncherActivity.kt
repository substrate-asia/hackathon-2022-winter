package com.polkadot.bt.ui.splash

import android.app.AlertDialog
import android.content.Context
import android.os.Bundle
import android.text.method.LinkMovementMethod
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.tencent.bugly.crashreport.CrashReport
import com.polkadot.bt.R
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.databinding.DialogVtlStatementBinding
import com.polkadot.bt.dialog.UpdateDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.room.ValueDatabase
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.init.InitActivity
import com.polkadot.bt.ui.main.MainActivity
import com.wang.avi.AVLoadingIndicatorView
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import retrofit2.HttpException
import splitties.activities.start
import kotlin.system.exitProcess

/**
 * @author Heaven
 * @date 2022/8/3 16:36
 */
class LauncherActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        StatusBarUtil.setDarkMode(this)
        StatusBarUtil.setTranslucent(this, 0)
        setContentView(R.layout.launcher_activity)
        VebZteKeyService.instance()?.init(this)
        checkAgree()

    }

    private fun checkAgree() {
        if (MySharedPreferences.get(Constants.NETWORK_ENABLE, false) != true) {
            val dialogBinding = DialogVtlStatementBinding.inflate(layoutInflater)
            dialogBinding.tvContent.movementMethod = LinkMovementMethod.getInstance()
            val dialog = BottomSheetDialog(this, R.style.MBottomSheetDialog)
            dialog.setContentView(dialogBinding.root)
            dialog.setOnDismissListener {
                if (MySharedPreferences.get(Constants.NETWORK_ENABLE, false) != true)
                    finish()
            }
            dialog.behavior.state = BottomSheetBehavior.STATE_EXPANDED
            dialog.behavior.addBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
                override fun onStateChanged(bottomSheet: View, newState: Int) {
                    if (newState == BottomSheetBehavior.STATE_COLLAPSED)
                        dialog.behavior.state = BottomSheetBehavior.STATE_EXPANDED
                }

                override fun onSlide(bottomSheet: View, slideOffset: Float) {}

            })
            dialog.show()
            dialogBinding.btnDialogConfirmCancel.setOnClickListener {
                dialog.dismiss()
            }
            dialogBinding.btnDialogConfirmSubmit.setOnClickListener {
                MySharedPreferences.put(Constants.NETWORK_ENABLE, true)
                startAC()
                dialog.dismiss()
            }
        } else {
            startAC()
        }

    }

    private fun startAC() {
        CrashReport.initCrashReport(applicationContext, "060c117602", false)
        val loadingView: AVLoadingIndicatorView = findViewById(R.id.loadingView)
        lifecycleScope.doHttp({
            loadingView.visible()
            val response = HttpUtils.appUpdateApi.update()
            if (response.isSuccessful) {
                response.body()?.let {
                    UpdateDialog(this, it).show {
                        startIntroductory()
                    }
                } ?: startIntroductory()
            }
        }, {
            if (it is KotlinNullPointerException || (it is HttpException && (it.code() == 404 || it.code() == 204))) {
                startIntroductory()
                return@doHttp
            }
            AlertDialog.Builder(this)
                .setMessage(getString(R.string.network_connect_failed))
                .setPositiveButton(getString(R.string.ok)) { dialog, _ ->
                    dialog.dismiss()
                    exitProcess(0)
                }
                .setCancelable(false)
                .show()
            it.printStackTrace()
        })
    }

    private fun startIntroductory() {
        lifecycleScope.launch {
            val isFirst = MySharedPreferences.get("isFirst", true)
            if (isFirst) {
                start<IntroductoryActivity>()
                MySharedPreferences.put("isFirst", false)
                finish()
            } else {
                delay(1000)
                start()
            }
        }
    }

    private fun start() {
        lifecycleScope.launch {
            if (ValueDatabase.get(this@LauncherActivity).getAllValue().isEmpty()) {
                if (ValueDatabaseNew.get(this@LauncherActivity).getAllValue().isEmpty()) {
                    start<InitActivity>()
                } else {
                    start<MainActivity>()
                }
            } else {
                if (ValueDatabaseNew.get(this@LauncherActivity).getAllValue().isEmpty()) {
                    //重新导数据
                    val old = ValueDatabase.get(this@LauncherActivity).getAllValue()
                    old.forEach {
                        val value = LocalValueEntityNew()
                        value.id = it.id
                        value.name = it.name
                        value.password = it.password
                        value.mnemonic = it.mnemonic
                        value.isBackup = it.isBackup
                        val linkList = mutableListOf<LinkEntityNew>()
                        it.linkList.forEach { entity ->
                            val entityNew = LinkEntityNew()
                            entityNew.id = entity.id
                            entityNew.valueId = entity.valueId
                            entityNew.link = entity.link
                            entityNew.icon = entity.icon
                            entityNew.mnemonic = entity.mnemonic.toByteArray()
                            entityNew.privateKey = entity.privateKey
                            entityNew.address = entity.address
                            entityNew.linkId = entity.linkId
                            entityNew.fileName = entity.fileName
                            entityNew.linkNumber = entity.linkNumber
                            entityNew.linkPrice = entity.linkPrice
                            entityNew.coinAddress = entity.coinAddress
                            entityNew.isSelect = entity.isSelect
                            entityNew.channel = entity.channel
                            entityNew.decimals = entity.decimals
                            linkList.add(entityNew)
                        }
                        value.linkList = linkList
                        ValueDatabaseNew.get(this@LauncherActivity).insertValue(value)
                    }
                }
                start<MainActivity>()
            }
            finish()
        }
    }

    /*
   * 语言切换
   * */
    override fun attachBaseContext(newBase: Context) {
        lifecycleScope.launch {
            val language=MySharedPreferences.get("language",Utils.getSystemLanguage(true))
            super.attachBaseContext(LanguageUtil.attachBaseContext(newBase,language))
        }

    }
}