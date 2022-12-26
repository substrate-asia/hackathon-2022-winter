package com.polkadot.bt.ui

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.view.View
import android.webkit.*
import com.polkadot.bt.databinding.WebViewActivityBinding
import com.polkadot.bt.dialog.WebDialog
import com.polkadot.bt.ext.*


class BaseWebViewActivity : BaseActivity<WebViewActivityBinding>() {

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
        val title = intent.getStringExtra("title") ?: ""
        val url = intent.getStringExtra("url") ?: ""
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

            override fun onReceivedTitle(view: WebView, title: String?) {}
        }

        binding.webView.webViewClient = object :WebViewClient(){
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return false
            }
        }

        binding.more.setOnClickListener {

            WebDialog(this,
                share = {
                    val intent = Intent().apply {
                        action = Intent.ACTION_SEND
                        putExtra(Intent.EXTRA_TEXT,url)
                        type = "text/plain"
//                        setDataAndType(Uri.parse(url), "*/*")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(Intent.createChooser(intent, "Choose a channel to share your url..."))
                },
                refresh = {
                    binding.webView.reload()
                }, copy = {
                    copyToClipboard(this,url)
                }).show()
        }
        binding.webView.loadUrl(url)
    }
}