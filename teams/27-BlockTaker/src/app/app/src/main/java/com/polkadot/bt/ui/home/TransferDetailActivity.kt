package com.polkadot.bt.ui.home

import androidx.lifecycle.lifecycleScope
import bchain.ETHChain
import com.polkadot.bt.R
import com.polkadot.bt.bean.HistoryItem
import com.polkadot.bt.data.*
import com.polkadot.bt.databinding.TransferDetailActivityBinding
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.BaseWebViewActivity
import splitties.activities.start
import java.text.DecimalFormat
import kotlin.math.pow

/**
 * @author Heaven
 * @date 2022/8/9 9:35
 */
class TransferDetailActivity : BaseActivity<TransferDetailActivityBinding>() {
    private var history: HistoryItem? = null
    private var link = ""
    private var baseUrl = ""
    private var channel = ""
    private var unit = ""
    private var fee = ""
    private var decimals = 18

    override fun initBinding() = TransferDetailActivityBinding.inflate(layoutInflater)

    override fun init() {
        binding.payeeAddress.setRightListener {
            copyToClipboard(this, binding.payeeAddress.getContentText())
        }
        binding.paymentAddress.setRightListener {
            copyToClipboard(this, binding.paymentAddress.getContentText())
        }
        binding.hash.setRightListener {
            copyToClipboard(this, binding.hash.getContentText())
        }
        binding.queryDetail.setOnClickListener {
            baseUrl =
                if (channel.isEmpty()) {
                    when (link) {
                        "DOT" -> Constants.API_WEBVIEW_DOT
                        "BTC" -> Constants.API_WEBVIEW_BTC
                        "ETH" -> Constants.API_WEBVIEW_ETH
                        "BNB" -> Constants.API_WEBVIEW_BNB
                        "HT" -> Constants.API_WEBVIEW_HECO
                        "AVAX" -> Constants.API_WEBVIEW_AVAX
                        "MATIC" -> Constants.API_WEBVIEW_MATIC
                        else -> ""
                    }
                } else {
                    when (channel) {
                        "OMNI" -> Constants.API_WEBVIEW_BTC
                        "ERC20" -> Constants.API_WEBVIEW_ETH
                        "BEP20" -> Constants.API_WEBVIEW_BNB
                        "HRC20" -> Constants.API_WEBVIEW_HECO
                        "MATIC" -> Constants.API_WEBVIEW_MATIC
                        "AVAX C-Chain" -> Constants.API_WEBVIEW_AVAX
                        else -> ""
                    }
                }
            start<BaseWebViewActivity> {
                putExtra("title", getString(R.string.transfer_detail))
                putExtra("url", baseUrl + history?.hash)
            }
        }

        lifecycleScope.doHttp {
            history = intent?.getSerializableExtra("detail") as HistoryItem
            link = intent.getStringExtra("link") ?: ""
            channel = intent.getStringExtra("channel") ?: ""
            fee = intent.getStringExtra("fee") ?: ""
            decimals = intent.getIntExtra("decimals", 18)
            unit = when (channel) {
                "OMNI" -> "BTC"
                "ERC20" -> "ETH"
                "BEP20" -> "BNB"
                "HRC20" -> "HT"
                "MATIC" -> "MATIC"
                "AVAX C-Chain" -> "AVAX"
                else -> link
            }
            if (history != null) {
                binding.payeeAddress.setContentText(history!!.to)
                binding.paymentAddress.setContentText(history!!.from)
                binding.hash.setContentText(history!!.hash)
                if (link == "DOT") {
                    binding.amount.setContentText("${history!!.value} $link")
                } else {
                    binding.amount.setContentText("${getNoMoreThanEightDigits(history!!.value.toDouble() / 10.0.pow(decimals!!))} $link")
                }


                binding.time.text = transDate(history?.timeStamp!!)
                if (fee.isEmpty()) {
                    fee = if (link == "BTC") {
                        BTCUtils.getBTCGasInfo(
                            history!!.gasPrice, history!!.gas,
                            (history!!.value.toDouble() / 10.0.pow(decimals!!)).toString()//后期需调整
                        )
                    } else if (channel == "OMNI") {
                        BTCUtils.getBTCTokenGasInfo(history!!.gasPrice, history!!.gas)//后期需调整
                    } else if (link == "DOT") {
                        DecimalFormat("0.########").format(history!!.gas.toDouble() / 10.0.pow(decimals))
                    } else {
                        ETHChain.getInstance().getGasInfo(history!!.gasPrice, history!!.gas)
                    }
                }
                binding.absenteeismFee.setContentText(fee + unit)
                getStatus()
            }
        }
    }

    override fun onResume() {
        getStatus()
        super.onResume()
    }

    private fun getStatus() {
        if (history?.txreceipt_status == "1") {
            loadImage(this, R.drawable.packing_success, binding.logo)
            binding.status.text = getString(R.string.packing_success)
            return
        }

        //获取交易状态
        lifecycleScope.doHttp {
            val status =
                if (channel.isEmpty()) {
                    when (link) {
                        "DOT" -> DOTUtils.getStatus(history!!.hash)
                        "BTC" -> {
                            val result = BTCUtils.getStatus(history?.hash!!)
                            if (result == 2) 1 else result
                        }
                        "ETH" -> ETHUtils.getStatus(history!!.hash)
                        "BNB" -> BNBUtils.getStatus(history!!.hash)
                        "HT" -> HTUtils.getStatus(history!!.hash)
                        "AVAX" -> AVAXUtils.getStatus(history!!.hash)
                        "MATIC" -> MATICUtils.getStatus(history!!.hash)
                        else -> 0
                    }
                } else {
                    when (channel) {
                        "OMNI" -> {
                            val result = BTCUtils.getStatus(history?.hash!!)
                            if (result == 2) 1 else result
                        }
                        "ERC20" -> ETHUtils.getStatus(history!!.hash)
                        "BEP20" -> BNBUtils.getStatus(history!!.hash)
                        "HRC20" -> HTUtils.getStatus(history!!.hash)
                        "MATIC" -> MATICUtils.getStatus(history!!.hash)
                        "AVAX C-Chain" -> AVAXUtils.getStatus(history!!.hash)
                        else -> 0
                    }
                }


            if (status == 1) {
                loadImage(this, R.drawable.packing_success, binding.logo)
                binding.status.text = getString(R.string.packing_success)
            } else {
                loadImage(this, R.drawable.packing, binding.logo)
                binding.status.text = getString(R.string.packing)
            }
        }
    }
}