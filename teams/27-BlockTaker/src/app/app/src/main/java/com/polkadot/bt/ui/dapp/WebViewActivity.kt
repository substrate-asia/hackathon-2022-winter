package com.polkadot.bt.ui.dapp

import android.annotation.SuppressLint
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.text.TextUtils
import android.view.View
import android.webkit.*
import com.polkadot.bt.R
import com.polkadot.bt.databinding.WebViewActivityBinding
import com.polkadot.bt.dialog.WaitDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.module.wallet_connect.TimeoutCallback
import com.polkadot.bt.module.wallet_connect.WCController
import com.polkadot.bt.ui.BaseActivity
import splitties.toast.toast
import java.util.*


/**
 * @author Heaven
 * @date 2022/9/14 11:06
 */
class WebViewActivity : BaseActivity<WebViewActivityBinding>() {

    override fun initBinding() = WebViewActivityBinding.inflate(layoutInflater)

    @SuppressLint("SetJavaScriptEnabled", "IntentReset")
    override fun init() {
        super.init()
        binding.back.setOnClickListener {
            if (binding.webView.canGoBack()) {
                binding.webView.goBack()
            } else {
                finish()
            }
        }
        val icon = intent.getStringExtra("icon") ?: ""
        var title = intent.getStringExtra("title") ?: ""
        val url = intent.getStringExtra("url") ?: ""
        var desc = intent.getStringExtra("desc") ?: ""
        var isError = false

        val language = MySharedPreferences.get("language", Utils.getSystemLanguage(true))
        setLocale(if (language.contains("zh")) Locale.SIMPLIFIED_CHINESE else Locale.ENGLISH)

        binding.title.text = title
        binding.webView.clearCache(true)
        binding.webView.run {
            settings.javaScriptEnabled = true //设置JavaScrip
            settings.domStorageEnabled = true
            settings.javaScriptCanOpenWindowsAutomatically = true
//            settings.userAgentString = AppUtils.getUserAgent(requireActivity())
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            settings.setGeolocationEnabled(true)
        }
        binding.webView.webChromeClient = object : WebChromeClient() {

            override fun onShowFileChooser(webView: WebView, filePathCallback: ValueCallback<Array<Uri?>>?, fileChooserParams: FileChooserParams?): Boolean {
                return true
            }

            override fun onJsAlert(view: WebView, url: String, message: String, result: JsResult): Boolean {
                return super.onJsAlert(view, url, message, result)
            }

            override fun onProgressChanged(view: WebView, newProgress: Int) {
                if (newProgress == 100) {
                    binding.progressBar.visibility = View.INVISIBLE
                } else {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.progressBar.progress = newProgress
                }
            }

            override fun onReceivedTitle(view: WebView, webTitle: String?) {
                if (TextUtils.isEmpty(title) && TextUtils.isEmpty(desc) && !TextUtils.isEmpty(webTitle) && !isError) {
                    title = webTitle!!
                    desc = webTitle
                    binding.title.text = title
                    addHistory(icon, url, title, desc)
                }
            }
        }

        binding.webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                if (url.startsWith("http", true)) {
                    return false
                } else if (url.startsWith("wc:", true)) {
//                    startActivity(Intent(Intent.ACTION_VIEW).setData(Uri.parse(url)))
                    if (url.contains("bridge"))
                        WCController.connect(url, 1, object : TimeoutCallback {
                            override fun timeout() {
                                WaitDialog.dismiss()
                                WCController.disConnect()
                                toast(this@WebViewActivity.getString(R.string.connect_timeout))
                            }
                        })
                }
                return true
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                isError = true
                super.onReceivedError(view, request, error)
            }
        }
        binding.more.setOnClickListener {
            val hasCollect = hasCollect(url, title)
            MoreDialog(this, hasCollect,
                share = {
                    val intent = Intent().apply {
                        action = Intent.ACTION_SEND
                        setDataAndType(Uri.parse(url), "*/*")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(Intent.createChooser(intent, "Choose a channel to share your url..."))
                },
                collection = {
                    addHistory(icon, url, title, desc, 0, !hasCollect)
                },
                refresh = {
                    binding.webView.reload()
                }, copy = {
                    copyToClipboard(this,url)
                }).show()
        }

        binding.webView.loadUrl(url)
    }

    override fun onBackPressed() {
        binding.back.performClick()
    }

    override fun onDestroy() {
        if (WCController.connectType == 1)
            WCController.disConnect()
        WebStorage.getInstance().deleteAllData()
        super.onDestroy()
    }

    private fun setLocale(locale: Locale?) {
        val configuration: Configuration = resources.configuration
        Locale.setDefault(locale)
        configuration.setLocale(locale)
        createConfigurationContext(configuration)
        createConfigurationContext(configuration)
        resources.updateConfiguration(
            configuration,
            resources.displayMetrics
        )
    }
}