package com.polkadot.bt.ui.dapp

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.text.InputFilter
import android.util.Log
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import bchain.*
import com.blankj.utilcode.util.ToastUtils
import com.bumptech.glide.Glide
import com.bumptech.glide.request.RequestOptions
import com.trustwallet.walletconnect.models.ethereum.WCEthereumTransaction
import com.polkadot.bt.R
import com.polkadot.bt.bean.GasPrice
import com.polkadot.bt.bean.HistoryItem
import com.polkadot.bt.data.*
import com.polkadot.bt.databinding.ActivityWalletConnectTransactionBinding
import com.polkadot.bt.dialog.InputPasswordDialog
import com.polkadot.bt.dialog.TransferDialog
import com.polkadot.bt.dialog.WaitDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.module.wallet_connect.WCController
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.home.TransferDetailActivity
import kotlinx.coroutines.launch
import org.web3j.crypto.Credentials
import splitties.activities.start
import splitties.views.imageResource
import splitties.views.padding
import java.text.NumberFormat
import java.util.regex.Pattern
import kotlin.math.pow

/**
 * Create:NoahZhao
 * Date:2022/9/25 1:07
 * Description:WalletConnectTransferActivity
 */
class WalletConnectTransactionActivity : BaseActivity<ActivityWalletConnectTransactionBinding>() {
    var linkEntityNew: LinkEntityNew? = null
    var gasPrice: GasPrice? = null
    var btcFee: GasPrice? = null
    var btcPrice = "0"
    var currentFee = "0"
    var currentGasPrice = "0"
    var gasLimit: String = "200000"
    var unit: String = ""
    var onlySign: Boolean = false

    override fun initBinding(): ActivityWalletConnectTransactionBinding = ActivityWalletConnectTransactionBinding.inflate(layoutInflater)

    companion object {
        var sHandshakeId: Long? = null
        var sWCEthereumTransaction: WCEthereumTransaction? = null
        fun start(context: Context, linkEntityNew: LinkEntityNew, handshakeId: Long, wcEthereumTransaction: WCEthereumTransaction, onlySign: Boolean) {
            sHandshakeId = handshakeId
            sWCEthereumTransaction = wcEthereumTransaction
            context.startActivity(
                Intent(context, WalletConnectTransactionActivity::class.java)
                    .putExtra("link", linkEntityNew).putExtra("onlySign", onlySign)
            )
        }
    }

    @SuppressLint("SetTextI18n")
    override fun init() {
        linkEntityNew = intent?.getSerializableExtra("link") as LinkEntityNew
        onlySign = intent?.getBooleanExtra("onlySign", false)!!

        isSemiBold(
            binding.inputTransferAddress, binding.inputTransferAmount, binding.memo, binding.all, binding.absenteeismFee, binding.money, binding.slow,
            binding.recommend, binding.fast, binding.slowTime, binding.recommendTime, binding.fastTime, binding.customize, binding.name, binding.price,
            binding.unit, binding.limitName, binding.limitCount, binding.limitUnit, binding.btnSubmit, binding.btnReject
        )

        Glide.with(this)
            .load(WCController.lastPeer!!.icons[0])
            .apply(RequestOptions().circleCrop().placeholder(R.drawable.shape_d8d8d8_circle_bg))
            .into(binding.ivIcon)
        binding.tvName.text = "${WCController.lastPeer!!.name}"

        binding.inputTransferFromAddress.setText(sWCEthereumTransaction!!.from)
        binding.inputTransferAddress.setText(sWCEthereumTransaction!!.to)

        val amount = if (sWCEthereumTransaction!!.value != null) sWCEthereumTransaction!!.value!!.removePrefix("0x").toLong(16).toDouble() / 10.0.pow(18).toLong() else 0
        val instance = NumberFormat.getInstance()
        instance.isGroupingUsed = false //设置不使用科学计数器
        instance.maximumFractionDigits = 28 //小数点最大位数
        val result = instance.format(amount)
        binding.inputTransferAmount.setText(result)
        binding.tvContent.setText(sWCEthereumTransaction!!.data)
        if (sWCEthereumTransaction!!.gasLimit != null) {
            gasLimit = sWCEthereumTransaction!!.gasLimit!!
        }

        when (linkEntityNew?.link) {

            "BTC" -> {
                binding.slow.text = getString(R.string.slow_btc)
                binding.recommend.text = getString(R.string.recommend_btc)
                binding.fast.text = getString(R.string.fast_btc)
                binding.slowTime.text = getString(R.string.slow_time_btc)
                binding.recommendTime.text = getString(R.string.recommend_time_btc)
                binding.fastTime.text = getString(R.string.fast_time_btc)

                binding.unit.text = "sat/b"

            }
            else -> {
                binding.slow.text = getString(R.string.slow, 142)
                binding.recommend.text = getString(R.string.recommend, 150)
                binding.fast.text = getString(R.string.fast, 150)
                binding.slowTime.text = getString(R.string.slow_time)
                binding.recommendTime.text = getString(R.string.recommend_time)
                binding.fastTime.text = getString(R.string.fast_time)
                binding.unit.text = "GWEI"
            }
        }

        //设置资产
//        binding.assets.text = "${getString(R.string.assets)}${linkEntity?.linkNumber} ${linkEntity?.link}"
        binding.absenteeismFee.text = "0.000 ${linkEntityNew?.link}"
        binding.money.text = "$0.000"
        binding.name.text = "Gas Price"
        binding.price.text = "10"
//        binding.unit.text = "GWEI"
        binding.limitName.text = "Gas Limit"
        binding.limitCount.text = "21000"
        binding.limitUnit.text = "GAS"


        click(binding.customize, binding.arrow) {
            binding.priceLayout.isSelected = !binding.priceLayout.isSelected
            binding.priceLayout.visibleOrGone(binding.priceLayout.isSelected)
            binding.limitLayout.isSelected = !binding.limitLayout.isSelected
            binding.limitLayout.visibleOrGone(binding.limitLayout.isSelected)
        }
        click(binding.slowCircle) {
            binding.slowCircle.padding = dp2px(12)
            binding.recommendCircle.padding = dp2px(15)
            binding.fastCircle.padding = dp2px(15)
            binding.forward.background = getDrawable(R.color.background)
            binding.next.background = getDrawable(R.color.background)
            binding.recommendCircle.imageResource = R.drawable.circle_grey
            binding.fastCircle.imageResource = R.drawable.circle_grey
            setFee(1)
        }
        click(binding.recommendCircle) {
            binding.slowCircle.padding = dp2px(15)
            binding.recommendCircle.padding = dp2px(12)
            binding.fastCircle.padding = dp2px(15)
            binding.forward.background = getDrawable(R.color.black)
            binding.next.background = getDrawable(R.color.background)
            binding.recommendCircle.imageResource = R.drawable.circle_black
            binding.fastCircle.imageResource = R.drawable.circle_grey
            setFee(2)
        }
        click(binding.fastCircle) {
            binding.slowCircle.padding = dp2px(15)
            binding.recommendCircle.padding = dp2px(15)
            binding.fastCircle.padding = dp2px(12)
            binding.forward.background = getDrawable(R.color.black)
            binding.next.background = getDrawable(R.color.black)
            binding.recommendCircle.imageResource = R.drawable.circle_black
            binding.fastCircle.imageResource = R.drawable.circle_black
            setFee(3)
        }

        binding.inputTransferAmount.addTextChangedListener {
            val regex = "^\\d+.$"
            val r = Pattern.compile(regex)
            val matcher = r.matcher(it.toString())
            if (matcher.matches()) {
                binding.inputTransferAmount.filters = arrayOf(InputFilter.LengthFilter(it.toString().length + 8))
            }
        }

        binding.btnSubmit.setOnClickListener {
            /* if (binding.inputTransferAddress.isNotEmpty()) {
                 binding.submit.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#FF1B1B1C"))
             }*/
            if (binding.inputTransferAddress.string().isEmpty()) {
                toast(getString(R.string.address_null))
                return@setOnClickListener
            }

            if (binding.inputTransferAddress.string() == linkEntityNew?.address) {
                toast(R.string.address_as)
                return@setOnClickListener
            }
            if (binding.inputTransferAmount.string().isEmpty()) {
                toast(getString(R.string.money_null))
                return@setOnClickListener
            }
            //if (binding.inputTransferAmount.string().trim().toDouble() > linkEntity?.linkNumber!!.toDouble()) {
            //    toast(getString(R.string.money_exceed_max))
            //    return@setOnClickListener
            //}
            if (binding.inputTransferAmount.string().trim().toDouble() < 0.00000546 && linkEntityNew?.link == "BTC") {
                toast(getString(R.string.money_exceed_min_btc))
                return@setOnClickListener
            }

            lifecycleScope.doHttp({
                WaitDialog.showRound()
                //手续费问题判断
                /*
                * 主币转账资产大于转账金额和手续费
                * 代币转账主币资产大于手续费
                * */
                if (linkEntityNew?.channel!!.isEmpty()) {
                    if (linkEntityNew?.link == "BTC") {
                        currentFee = BTCUtils.getBTCGasInfo(linkEntityNew?.address!!, btcPrice, binding.inputTransferAmount.string())
                    }
                    //计算资产资产，扣除矿工费
                    //if (binding.inputTransferAmount.string().trim().toDouble() + currentFee.toDouble() > linkEntity?.linkNumber!!.toDouble()) {
                    //    toast(getString(R.string.money_exceed_max))
                    //    return@doHttp
                    //}
                } else {
                    //todo 获取当前主链的余额
                    //...
                }
                if (currentFee == "0") {
                    toast(getString(R.string.wait_fee))
                    WaitDialog.dismiss()
                    return@doHttp
                }

                //TODO case1 签名交易
                if (onlySign) {
                    lifecycleScope.doHttp({
                        val credentials = ETHUtils.getCredentialsByPrvKey(String(linkEntityNew?.privateKey!!))
                        when (linkEntityNew?.link) {
                            "ETH" -> {
                                WCController.wcClient.approveRequest(
                                    sHandshakeId!!, ETHUtils.signETH(credentials, sWCEthereumTransaction!!.to!!, binding.inputTransferAmount.string(), currentGasPrice, gasLimit)
                                ) // hex formatted sign
                            }
                            "BNB" -> {
                                WCController.wcClient.approveRequest(
                                    sHandshakeId!!, BNBUtils.signBNB(credentials, sWCEthereumTransaction!!.to!!, binding.inputTransferAmount.string(), currentGasPrice, gasLimit)
                                ) // hex formatted sign
                            }
                            "AVAX" -> {
                                WCController.wcClient.approveRequest(
                                    sHandshakeId!!, AVAXUtils.signAVAX(credentials, sWCEthereumTransaction!!.to!!, binding.inputTransferAmount.string(), currentGasPrice, gasLimit)
                                ) // hex formatted sign
                            }
                            else -> {
                                ToastUtils.showShort("error")
                                return@doHttp
                            }
                        }

                        ToastUtils.showShort(R.string.success)
                        WaitDialog.dismiss()
                        finish()
                    }, {
                        ToastUtils.showShort(R.string.failure)
                        WaitDialog.dismiss()
                    })
                }
                //TODO case2 发起交易
                else {
                    //转账信息弹窗
                    TransferDialog(
                        this@WalletConnectTransactionActivity,
                        //转账精确到小数点后八位
                        getNoMoreThanEightDigits(binding.inputTransferAmount.string().trim().toDouble()) + unit,
                        linkEntityNew?.address!!,
                        binding.inputTransferAddress.string(),
                        currentFee + unit, binding.memo.string()
                    ) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
                            MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) == true &&
                            Utils.hasBiometricEnrolled(this)) {
                            Utils.useFingerprint(this, object : BiometricPrompt.AuthenticationCallback() {
                                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                                    super.onAuthenticationError(errorCode, errString)
                                    // 5次属于错误
                                    Log.i(TAG, "onAuthenticationError $errString")
                                }
                                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                                    super.onAuthenticationSucceeded(result)
                                    // 成功
                                    Log.i(TAG, "onAuthenticationSucceeded $result")
                                    send()
                                }
                                override fun onAuthenticationFailed() {
                                    super.onAuthenticationFailed()
                                    // 单次失败
                                    Log.i(TAG, "onAuthenticationFailed ")
                                }
                            })
                        } else {
                            InputPasswordDialog(this@WalletConnectTransactionActivity) {
                                lifecycleScope.launch {
                                    val id = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                                    val value = ValueDatabaseNew.get(this@WalletConnectTransactionActivity).getValue(id)
                                    if (it == value?.password) {
                                        send()
                                    } else {
                                        toast(R.string.password_error)
                                    }
                                }
                            }.show()
                        }
                    }.show()
                    WaitDialog.dismiss()
                }
            }, {
                WaitDialog.dismiss()
            })
        }
        binding.btnReject.setOnClickListener {
            WCController.wcClient.rejectRequest(sHandshakeId!!)
            finish()
        }
        binding.recommend.setTextColor(Color.parseColor("#FF1B1B1C"))
        binding.recommendTime.setTextColor(Color.parseColor("#FF1B1B1C"))
        initData()
    }

    private fun initData() {
        lifecycleScope.doHttp({
            when (linkEntityNew?.link) {
                "ETH" -> {
                    gasPrice = ETHUtils.getETHGasPrice()
                    //gasLimit = ETHChain.getInstance().nativeGasLimit
                    unit = linkEntityNew?.link!!
                }
                "BTC" -> {
                    btcFee = BTCUtils.getBTCGasFee()
                    currentFee = btcFee?.mid!!
                    unit = linkEntityNew?.link!!
                }
                "BNB" -> {
                    gasPrice = BNBUtils.getBNBGasPrice()
                    //gasLimit = BNBChain.getInstance().nativeGasLimit
                    unit = linkEntityNew?.link!!
                }
                "HT" -> {
                    gasPrice = HTUtils.getHTGasPrice()
                    //gasLimit = HTChain.getInstance().nativeGasLimit
                    unit = linkEntityNew?.link!!
                }
                "AVAX" -> {
                    gasPrice = AVAXUtils.getAVAXGasPrice()
                    //gasLimit = AVAXChain.getInstance().nativeGasLimit
                    unit = linkEntityNew?.link!!
                }
                "MATIC" -> {
                    gasPrice = MATICUtils.getMATICGasPrice()
                    //gasLimit = MATICChain.getInstance().nativeGasLimit
                    unit = linkEntityNew?.link!!
                }
                else -> {
                    when (linkEntityNew?.channel) {
                        "ERC20" -> {
                            gasPrice = ETHUtils.getETHGasPrice()
                            gasLimit = ETHChain.getInstance().tokenGasLimit
                            unit = "ETH"
                        }
                        "BEP20" -> {
                            gasPrice = BNBUtils.getBNBGasPrice()
                            gasLimit = BNBChain.getInstance().tokenGasLimit
                            unit = "BNB"
                        }
                        "HRC20" -> {
                            gasPrice = HTUtils.getHTGasPrice()
                            gasLimit = HTChain.getInstance().tokenGasLimit
                            unit = "HT"
                        }
                        "MATIC" -> {
                            gasPrice = MATICUtils.getMATICGasPrice()
                            gasLimit = MATICChain.getInstance().tokenGasLimit
                            unit = "MATIC"
                        }
                        "AVAX C-Chain" -> {
                            gasPrice = AVAXUtils.getAVAXGasPrice()
                            gasLimit = AVAXChain.getInstance().tokenGasLimit
                            unit = "AVAX"
                        }
                    }
                }
            }
            binding.slow.text = getString(R.string.slow, gasPrice!!.slow.toLong() / 10.0.pow(9).toLong())
            binding.recommend.text = getString(R.string.recommend, gasPrice!!.mid.toLong() / 10.0.pow(9).toLong())
            binding.fast.text = getString(R.string.fast, gasPrice!!.fast.toLong() / 10.0.pow(9).toLong())
            //获取单个币的价格
            val price = HttpUtils.linkApi.getPrice(linkEntityNew!!.link)
            linkEntityNew!!.linkPrice = if (price.current_price.isNullOrEmpty()) "0.0" else price.current_price
            setFee(2)
        }, {
            ToastUtils.showLong("get Gas Error")
        })
    }

    private fun setFee(type: Int) {
        val loading = WaitDialog.showRound()
        lifecycleScope.doHttp({
            if (linkEntityNew?.link == "BTC") {
                when (type) {
                    1 -> btcPrice = btcFee?.slow!!
                    2 -> btcPrice = btcFee?.mid!!
                    3 -> btcPrice = btcFee?.fast!!
                }

                if (binding.inputTransferAmount.string().isNotEmpty()) {
                    currentFee = BTCUtils.getBTCGasInfo(linkEntityNew?.address!!, btcPrice, binding.inputTransferAmount.string())
                    binding.absenteeismFee.text = currentFee + linkEntityNew?.link
                    binding.money.text = "$${getNoMoreThanEightDigits(currentFee?.toDouble()!! * linkEntityNew?.linkPrice?.toDouble()!!)}"
                } else {
                    toast("计算费率需要金额")
                }

            } else {
                when (type) {
                    1 -> {
                        currentGasPrice = gasPrice!!.slow
                    }
                    2 -> {
                        currentGasPrice = gasPrice!!.mid
                    }
                    3 -> {
                        currentGasPrice = gasPrice!!.fast
                    }
                }
                currentFee = ETHChain.getInstance().getGasInfo(currentGasPrice, gasLimit)
                binding.absenteeismFee.text = "${currentFee}$unit"
                binding.money.text = "$${getNoMoreThanEightDigits(currentFee?.toDouble()!! * linkEntityNew?.linkPrice?.toDouble()!!)}"
            }
            loading?.cancel()
        }, {
            loading?.cancel()
        })
    }

    private fun send() {
        var credentials: Credentials? = null
        val loading = WaitDialog.showRound()
        lifecycleScope.doHttp({
            if (linkEntityNew?.link != "BTC") {
                credentials = ETHUtils.getCredentialsByPrvKey(String(linkEntityNew?.privateKey!!))
            }

            var hash: String
            when (linkEntityNew?.link) {
                "ETH" -> {
                    if (sWCEthereumTransaction!!.value == null) {
                        hash = ETHUtils.sendCallData(credentials!!, binding.inputTransferAddress.string(), currentGasPrice, gasLimit, sWCEthereumTransaction!!.data)
                    } else {
                        hash = ETHUtils.sendCallDataByNative(
                            credentials!!, binding.inputTransferAddress.string(), sWCEthereumTransaction!!.value!!.removePrefix("0x").toLong(16).toString(),
                            currentGasPrice,
                            gasLimit,
                            sWCEthereumTransaction!!.data
                        )
                    }
                }
                "BNB" -> {
                    if (sWCEthereumTransaction!!.value == null) {
                        hash = BNBUtils.sendCallData(credentials!!, binding.inputTransferAddress.string(), currentGasPrice, gasLimit, sWCEthereumTransaction!!.data)
                    } else {
                        hash = BNBUtils.sendCallDataByNative(
                            credentials!!, binding.inputTransferAddress.string(), sWCEthereumTransaction!!.value!!.removePrefix("0x").toLong(16).toString(),
                            currentGasPrice,
                            gasLimit,
                            sWCEthereumTransaction!!.data
                        )
                    }
                }
                "AVAX" -> {
                    if (sWCEthereumTransaction!!.value == null) {
                        hash = AVAXUtils.sendCallData(credentials!!, binding.inputTransferAddress.string(), currentGasPrice, gasLimit, sWCEthereumTransaction!!.data)
                    } else {
                        hash = AVAXUtils.sendCallDataByNative(
                            credentials!!, binding.inputTransferAddress.string(), sWCEthereumTransaction!!.value!!.removePrefix("0x").toLong(16).toString(),
                            currentGasPrice,
                            gasLimit,
                            sWCEthereumTransaction!!.data
                        )
                    }
                }
                else -> {
                    ToastUtils.showShort("error")
                    return@doHttp
                }
            }

            if (hash.isNotEmpty()) {
                toast(getString(R.string.trans_send))
                WCController.wcClient.approveRequest(sHandshakeId!!, hash) // hex formatted sign
                start<TransferDetailActivity> {
                    putExtra(
                        "detail", HistoryItem(
                            (System.currentTimeMillis() / 1000L).toString(), to = binding.inputTransferAddress.string(),
                            linkEntityNew?.address!!, (binding.inputTransferAmount.string().toDouble() * 10.0.pow(18.0)).toString(), gasLimit, currentGasPrice, hash, "0"
                        )
                    )
                    putExtra("link", linkEntityNew?.link)
                    putExtra("channel", linkEntityNew?.channel)
                }
                finish()
            }
            loading?.cancel()
        }, {
            toast(getString(R.string.trans_error))
            loading?.cancel()
        })
    }

    override fun onDestroy() {
        sHandshakeId = null
        sWCEthereumTransaction = null
        super.onDestroy()
    }

}