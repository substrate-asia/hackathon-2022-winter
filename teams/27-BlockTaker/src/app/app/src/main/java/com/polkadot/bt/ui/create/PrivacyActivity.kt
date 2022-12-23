package com.polkadot.bt.ui.create

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.webkit.WebView
import android.webkit.WebViewClient
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityPrivacyBinding
import com.polkadot.bt.ext.gone
import com.polkadot.bt.ext.visible
import com.polkadot.bt.ui.BaseVBActivity

class PrivacyActivity : BaseVBActivity<ActivityPrivacyBinding>() {
    override fun initBinding() = ActivityPrivacyBinding.inflate(layoutInflater)

    @SuppressLint("SetJavaScriptEnabled")
    override fun init() {
        binding.baseTitle.tvTitle.text = getText(R.string.legal_statement)
        binding.baseTitle.ivBack.setOnClickListener {
            onBackPressed()
        }
        binding.loadingView.visible()
        binding.webView.settings.javaScriptEnabled = true
        binding.webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                if (url.startsWith("http", true))
                    return false
                else {
                    startActivity(Intent(Intent.ACTION_VIEW).setData(Uri.parse(url)))
                }
                return true
            }
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.loadingView.gone()
            }
        }
        binding.webView.loadUrl(intent.data?.toString() ?: "https://www.vertu.com/")
    }

    override fun onBackPressed() {
        if (binding.webView.canGoBack())
            binding.webView.goBack()
        else
            super.onBackPressed()
    }
}