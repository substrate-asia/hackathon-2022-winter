package com.polkadot.bt.ui.home

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.text.InputFilter
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.isVisible
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import bchain.*
import bchain.entity.ReturnsEntity
import com.polkadot.bt.R
import com.polkadot.bt.bean.GasPrice
import com.polkadot.bt.bean.HistoryItem
import com.polkadot.bt.data.*
import com.polkadot.bt.databinding.TransferActivityBinding
import com.polkadot.bt.dialog.InputPasswordDialog
import com.polkadot.bt.dialog.LoadingDialog
import com.polkadot.bt.dialog.TransferDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.mine.AddressBookActivity
import kotlinx.coroutines.launch
import org.web3j.crypto.Credentials
import splitties.activities.start
import splitties.views.imageResource
import splitties.views.padding
import java.util.regex.Pattern
import kotlin.math.pow

class TransferActivity : BaseActivity<TransferActivityBinding>() {

    override fun initBinding() = TransferActivityBinding.inflate(layoutInflater)
    var linkEntityNew: LinkEntityNew? = null
    var gasPrice: GasPrice? = null
    var btcFee: GasPrice? = null
    var btcPrice = "0"
    private var currentFee = "0"
    var currentGasPrice = "0"
    var gasLimit: String = "21000"
    var unit: String = ""
    var mainLinkPrice: String = ""
    private var loading: LoadingDialog? = null
    var hasLimit = false
    var rate = 1.0
    var symbol = "$"
    var estimateFeesForTransactionTime = 0L

    @SuppressLint("SetTextI18n")
    override fun init() {
        linkEntityNew = intent?.getSerializableExtra("link") as LinkEntityNew
        loading = LoadingDialog(this)
        isSemiBold(
            binding.inputTransferAddress,
            binding.inputTransferAmount,
            binding.memo,
            binding.all,
            binding.absenteeismFee,
            binding.money,
            binding.slow,
            binding.recommend,
            binding.fast,
            binding.slowTime,
            binding.recommendTime,
            binding.fastTime,
            binding.customize,
            binding.name,
            binding.price,
            binding.unit,
            binding.limitName,
            binding.limitCount,
            binding.limitUnit,
            binding.submit
        )

        if (linkEntityNew?.link == "BTC" || linkEntityNew?.channel == "OMNI") {

            binding.slow.text = getString(R.string.slow_btc, 142)
            binding.recommend.text = getString(R.string.recommend_btc, 150)
            binding.fast.text = getString(R.string.fast_btc, 180)
            binding.slowTime.text = getString(R.string.slow_time_btc)
            binding.recommendTime.text = getString(R.string.recommend_time_btc)
            binding.fastTime.text = getString(R.string.fast_time_btc)

            binding.unit.text = "sat/b"
            binding.name.text = "Fee"
            binding.price.setText("100")

        } else {
            binding.slow.text = getString(R.string.slow, 142)
            binding.recommend.text = getString(R.string.recommend, 150)
            binding.fast.text = getString(R.string.fast, 180)
            binding.slowTime.text = getString(R.string.slow_time)
            binding.recommendTime.text = getString(R.string.recommend_time)
            binding.fastTime.text = getString(R.string.fast_time)
            binding.unit.text = "GWEI"
            hasLimit = true

            binding.name.text = "Gas Price"
            binding.price.setText("10")

            binding.limitName.text = "Gas Limit"
            binding.limitCount.text = "21000"
            binding.limitUnit.text = "GAS"
        }

        binding.money.text = "$0.000"
        //设置资产
        if (linkEntityNew!!.link == "DOT") {
            binding.transferTimeLayout.visibility = View.GONE
            val getDotGat = {
                if (binding.inputTransferAddress.string().isBlank() || binding.inputTransferAmount.string().isBlank()) {
                    binding.absenteeismFee.text = "0$unit"
                    binding.money.text = "${symbol}0"
                } else {
                    lifecycleScope.doHttp {
                        val currentTime = System.currentTimeMillis()
                        estimateFeesForTransactionTime = currentTime
                        binding.absenteeismFee.text = "获取中···"
                        binding.money.text = ""
                        val result = DOTUtils.estimateFeesForTransaction(
                            String(linkEntityNew?.privateKey!!),
                            linkEntityNew!!.address,
                            binding.inputTransferAddress.string(),
                            binding.inputTransferAmount.string()
                        )
                        if (currentTime == estimateFeesForTransactionTime) {
                            binding.absenteeismFee.text = "${result}$unit"
                            binding.money.text = "$symbol${getNoMoreThanEightDigits(result?.toDouble()!! * mainLinkPrice?.toDouble()!! * rate)}"
                            currentFee = result
                        }
                    }
                }
                true
            }
            binding.inputTransferAddress.addTextChangedListener {
                getDotGat.invoke()
            }
            binding.inputTransferAmount.addTextChangedListener {
                getDotGat.invoke()
            }
            val array = linkEntityNew?.linkNumber!!.split(":")
            binding.money.text = ""
            binding.assets.text = "${getString(R.string.assets)} ${getNoMoreThanEightDigits(array[0]?.toDouble()!!)}/${getNoMoreThanEightDigits(array[1]?.toDouble()!!)} ${linkEntityNew?.link} "
        } else {
            binding.assets.text = "${getString(R.string.assets)} ${getNoMoreThanEightDigits(linkEntityNew?.linkNumber!!.toDouble())} ${linkEntityNew?.link}"
        }


        binding.price.addTextChangedListener {

            val regex = "^\\d+.$"
            val r = Pattern.compile(regex)
            val matcher = r.matcher(it.toString())
            if (matcher.matches()) {
                binding.price.filters = arrayOf(InputFilter.LengthFilter(it.toString().length + 8))
            }

            //  处理前排的0
            if (it.toString().length > 1 && it.toString()[0].toString() == "0" && it.toString()[1].toString() != ".") {
                it?.delete(0, 1)
            }

            if (it.toString().isNotEmpty()) {
                setFee(4)
            } else {
                binding.absenteeismFee.text = "0"
                binding.money.text = "0"
            }
        }


        click(binding.customize, binding.arrow) {
            binding.priceLayout.isSelected = !binding.priceLayout.isSelected
            binding.priceLayout.visibleOrGone(binding.priceLayout.isSelected)
            if (hasLimit) {
                binding.limitLayout.isSelected = !binding.limitLayout.isSelected
                binding.limitLayout.visibleOrGone(binding.limitLayout.isSelected)
            }
            val params = binding.submit.layoutParams as ViewGroup.MarginLayoutParams
            params.topMargin = if (binding.priceLayout.isSelected) 40.dp else 98.dp
            binding.submit.layoutParams = params
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
            closeCustomize()
        }
        click(binding.recommendCircle, binding.forward) {
            binding.slowCircle.padding = dp2px(15)
            binding.recommendCircle.padding = dp2px(12)
            binding.fastCircle.padding = dp2px(15)
            binding.forward.background = getDrawable(R.color.black)
            binding.next.background = getDrawable(R.color.background)
            binding.recommendCircle.imageResource = R.drawable.circle_black
            binding.fastCircle.imageResource = R.drawable.circle_grey
            setFee(2)
            closeCustomize()
        }
        click(binding.fastCircle, binding.next) {
            binding.slowCircle.padding = dp2px(15)
            binding.recommendCircle.padding = dp2px(15)
            binding.fastCircle.padding = dp2px(12)
            binding.forward.background = getDrawable(R.color.black)
            binding.next.background = getDrawable(R.color.black)
            binding.recommendCircle.imageResource = R.drawable.circle_black
            binding.fastCircle.imageResource = R.drawable.circle_black
            setFee(3)
            closeCustomize()
        }


        val startActivity = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            if (it.data != null && it.resultCode == Activity.RESULT_OK) {
                val address = it.data?.getStringExtra("address")
                binding.inputTransferAddress.setText(address)
            }
        }

        val startScanActivity = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            if (it.data != null && it.resultCode == Constants.SCAN_RESULT) {
                val address = it.data?.getStringExtra("address")
                binding.inputTransferAddress.setText(address)
            }
        }


        binding.toolbar.setMoreListener {
//            start<ScanActivity>()
            startScanActivity.launch(Intent(this, ScanActivity::class.java).setAction(ScanActivity.ACTION_TRANSFER))
        }
        binding.addressBook.setOnClickListener {
//            start<AddressBookActivity>()
            startActivity.launch(
                Intent(this, AddressBookActivity::class.java).putExtra("isTransfer", true).putExtra("link", linkEntityNew?.link)
            )


        }
        binding.all.setOnClickListener {
            binding.inputTransferAmount.setText(linkEntityNew?.linkNumber)
        }
        binding.inputTransferAmount.addTextChangedListener {
            val regex = "^\\d+.$"
            val r = Pattern.compile(regex)
            val matcher = r.matcher(it.toString())
            if (matcher.matches()) {
                binding.inputTransferAmount.filters = arrayOf(InputFilter.LengthFilter(it.toString().length + 8))
            }

            //  处理前排的0
            if (it.toString().length > 1 && it.toString()[0].toString() == "0" && it.toString()[1].toString() != ".") {
                it?.delete(0, 1)
            }
        }

        binding.submit.clickNoRepeat {
            /* if (binding.inputTransferAddress.isNotEmpty()) {
                 binding.submit.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#FF1B1B1C"))
             }*/
            if (!Utils.isNetworkConnected(this)) {
                toast(getString(R.string.network_error))
                return@clickNoRepeat
            }

            if (binding.inputTransferAddress.string().isEmpty()) {
                toast(getString(R.string.address_null))
                return@clickNoRepeat
            }

            if (binding.inputTransferAddress.string() == linkEntityNew?.address) {
                toast(R.string.address_as)
                return@clickNoRepeat
            }
            //地址校验
            val isAddress = if (linkEntityNew?.link == "BTC") {
                BTCUtils.isBtcAddress(binding.inputTransferAddress.string())
            } else if (linkEntityNew?.link == "DOT") {
                //todo DOT地址有效性验证待实现
                true
            } else {
                isValidAddress(binding.inputTransferAddress.string())
            }
            if (!isAddress) {
                toast(R.string.address_error)
                return@clickNoRepeat
            }
            if (linkEntityNew?.link == "BTC") {
                if (binding.inputTransferAddress.string().startsWith("3") || binding.inputTransferAddress.string().startsWith("bc")) {
                    toast(R.string.address_not_support)
                    return@clickNoRepeat
                }
            }

            if (binding.inputTransferAmount.string().isEmpty()) {
                toast(getString(R.string.money_null))
                return@clickNoRepeat
            }
            val owned = if (linkEntityNew?.link == "DOT") {
                linkEntityNew?.linkNumber!!.split(":")[0].toDouble()
            } else {
                linkEntityNew?.linkNumber!!.toDouble()
            }
            if (binding.inputTransferAmount.string().trim().toDouble() > owned) {
                toast(getString(R.string.money_exceed_max))
                return@clickNoRepeat
            }
            if (binding.inputTransferAmount.string().trim().toDouble() < 0.00000546 && linkEntityNew?.link == "BTC") {
                toast(getString(R.string.money_exceed_min_btc))
                return@clickNoRepeat
            }

            loading?.show()
            lifecycleScope.doHttp({
                //手续费问题判断
                /*
                * 主币转账资产大于转账金额和手续费
                * 代币转账主币资产大于手续费
                * */
                if (linkEntityNew?.channel!!.isEmpty()) {
                    if (linkEntityNew?.link == "BTC") {
                        currentFee = BTCUtils.getBTCGasInfo(linkEntityNew?.address!!, btcPrice, binding.inputTransferAmount.string())
                    }
                    val owned = if (linkEntityNew?.link == "DOT") {
                        linkEntityNew?.linkNumber!!.split(":")[0].toDouble()
                    } else {
                        linkEntityNew?.linkNumber!!.toDouble()
                    }
                    //计算资产，扣除矿工费
                    if (binding.inputTransferAmount.string().trim().toDouble() + currentFee.toDouble() > owned) {
                        toast(getString(R.string.money_exceed_max))
                        loading?.cancel()
                        return@doHttp
                    }
                } else {
                    //获取当前主链的余额
                    val linkBalance = when (linkEntityNew?.channel) {
                        "OMNI" -> BTCUtils.getBtcNumber(linkEntityNew?.address!!)
                        "ERC20" -> ETHUtils.getETHNumber(linkEntityNew?.address!!)
                        "BEP20" -> BNBUtils.getBNBNumber(linkEntityNew?.address!!)
                        "HRC20" -> HTUtils.getHTNumber(linkEntityNew?.address!!)
                        "AVAX C-Chain" -> AVAXUtils.getAVAXNumber(linkEntityNew?.address!!)
                        "MATIC" -> MATICUtils.getMATICNumber(linkEntityNew?.address!!)
                        else -> linkEntityNew?.linkNumber
                    }
                    if (linkBalance?.toDouble()!! < currentFee.toDouble()) {
                        toast(getString(R.string.link_balance))
                        loading?.cancel()
                        return@doHttp
                    }
                }
                if (currentFee == "0") {
                    toast(getString(R.string.wait_fee))
                    loading?.cancel()
                    return@doHttp
                }


                //转账信息弹窗
                TransferDialog(
                    this@TransferActivity,
                    //转账精确到小数点后八位
                    getNoMoreThanEightDigits(binding.inputTransferAmount.string().trim().toDouble()) + linkEntityNew?.link,
                    linkEntityNew?.address!!,
                    binding.inputTransferAddress.string(),
                    currentFee + unit,
                    binding.memo.string()
                ) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) == true && Utils.hasBiometricEnrolled(this)) {
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
                        InputPasswordDialog(this@TransferActivity) {
                            lifecycleScope.launch {
                                val id = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                                val value = ValueDatabaseNew.get(this@TransferActivity).getValue(id)
                                if (it == value?.password) {
                                    send()
                                } else {
                                    toast(R.string.password_error)
                                }
                            }
                        }.show()
                    }
                }.show()
                loading?.cancel()
            }, { loading?.cancel() })
        }
        binding.recommend.setTextColor(Color.parseColor("#FF1B1B1C"))
        binding.recommendTime.setTextColor(Color.parseColor("#FF1B1B1C"))
        initData()
    }

    private fun closeCustomize() {
        if (binding.priceLayout.isVisible) {
            binding.priceLayout.isSelected = !binding.priceLayout.isSelected
            binding.priceLayout.gone()
            val params = binding.submit.layoutParams as ViewGroup.MarginLayoutParams
            params.topMargin = if (binding.priceLayout.isSelected) 40.dp else 98.dp
            binding.submit.layoutParams = params
        }
        if (binding.limitLayout.isVisible) {
            binding.limitLayout.isSelected = !binding.limitLayout.isSelected
            binding.limitLayout.gone()
        }
    }

    private fun initData() {

        lifecycleScope.doHttp {
            //获取最新汇率
            getRate()
            if (linkEntityNew?.channel?.isEmpty()!!) {
                when (linkEntityNew?.link) {
                    "DOT" -> {
//                        gasPrice = ETHUtils.getETHGasPrice()
//                        gasLimit = ETHChain.getInstance().nativeGasLimit
                        unit = linkEntityNew?.link!!
                        mainLinkPrice = linkEntityNew?.linkPrice!!
                    }
                    "ETH" -> {
                        gasPrice = ETHUtils.getETHGasPrice()
                        gasLimit = ETHChain.getInstance().nativeGasLimit
                        unit = linkEntityNew?.link!!
                        mainLinkPrice = linkEntityNew?.linkPrice!!
                    }
                    "BTC" -> {
                        val btcGasfee = HttpUtils.createApi(Constants.API_BTC_SINGLEPRICE).getBTCGasPrice()
                        btcFee = if (btcGasfee.fastestFee.isNullOrEmpty()) BTCUtils.getBTCGasFee() else GasPrice(
                            slow = btcGasfee.hourFee, mid = btcGasfee.halfHourFee, fast = btcGasfee.fastestFee
                        )
                        currentFee = btcFee?.mid!!
                        unit = linkEntityNew?.link!!
                        mainLinkPrice = linkEntityNew?.linkPrice!!
                    }
                    "BNB" -> {
                        gasPrice = BNBUtils.getBNBGasPrice()
                        gasLimit = BNBChain.getInstance().nativeGasLimit
                        unit = linkEntityNew?.link!!
                        mainLinkPrice = linkEntityNew?.linkPrice!!
                    }
                    "HT" -> {
                        gasPrice = HTUtils.getHTGasPrice()
                        gasLimit = HTChain.getInstance().nativeGasLimit
                        unit = linkEntityNew?.link!!
                        mainLinkPrice = linkEntityNew?.linkPrice!!
                    }

                    "AVAX" -> {
                        gasPrice = AVAXUtils.getAVAXGasPrice()
                        gasLimit = AVAXChain.getInstance().nativeGasLimit
                        unit = linkEntityNew?.link!!
                        mainLinkPrice = linkEntityNew?.linkPrice!!
                    }

                    "MATIC" -> {
                        gasPrice = MATICUtils.getMATICGasPrice()
                        gasLimit = MATICChain.getInstance().nativeGasLimit
                        unit = linkEntityNew?.link!!
                        mainLinkPrice = linkEntityNew?.linkPrice!!
                    }
                }
            } else {
                when (linkEntityNew?.channel) {
                    "OMNI" -> {
                        val btcGasfee = HttpUtils.createApi(Constants.API_BTC_SINGLEPRICE).getBTCGasPrice()
                        btcFee = if (btcGasfee.fastestFee.isNullOrEmpty()) BTCUtils.getBTCGasFee() else GasPrice(slow = btcGasfee.hourFee, mid = btcGasfee.halfHourFee, fast = btcGasfee.fastestFee)
                        currentFee = btcFee?.mid!!
                        unit = "BTC"
                    }
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
                val price = HttpUtils.linkApi.getPrice(unit)
                mainLinkPrice = price.current_price.ifEmpty { "0.0" }
            }

            if (linkEntityNew?.link == "BTC" || linkEntityNew?.channel == "OMNI") {
                binding.slow.text = getString(R.string.slow_btc, btcFee?.slow?.toInt())
                binding.recommend.text = getString(R.string.recommend_btc, btcFee?.mid?.toInt())
                binding.fast.text = getString(R.string.fast_btc, btcFee?.fast?.toInt()!! + 20)
                binding.slowTime.text = getString(R.string.slow_time_btc)
                binding.recommendTime.text = getString(R.string.recommend_time_btc)
                binding.fastTime.text = getString(R.string.fast_time_btc)
                binding.unit.text = "sat/b"
            } else {
                binding.slow.text = getString(R.string.slow, gasPrice?.slow?.toLong()!! / 10.0.pow(9).toLong())
                binding.recommend.text = getString(R.string.recommend, gasPrice?.mid?.toLong()!! / 10.0.pow(9).toLong())
                binding.fast.text = getString(R.string.fast, gasPrice?.fast?.toLong()!! / 10.0.pow(9).toLong())
                binding.slowTime.text = getString(R.string.slow_time)
                binding.recommendTime.text = getString(R.string.recommend_time)
                binding.fastTime.text = getString(R.string.fast_time)
                binding.unit.text = "GWEI"
                binding.limitCount.text = gasLimit
            }


            setFee(2)
        }

    }

    private fun getRate() {
        lifecycleScope.doHttp {
            val currency = MySharedPreferences.get("currency", "USD")
            symbol = getCurrencySymbol(currency)
            if (currency != "USD") {
                HttpUtils.linkApi.getRate().list.forEach {
                    if (currency == it.to) {
                        rate = it.price.toDouble()
                    }
                }
            }
        }
    }

    private fun setFee(type: Int) {
        lifecycleScope.doHttp {
            if (linkEntityNew?.link == "BTC" || linkEntityNew?.channel == "OMNI") {
                when (type) {
                    1 -> btcPrice = btcFee?.slow!!
                    2 -> btcPrice = btcFee?.mid!!
                    3 -> btcPrice = btcFee?.fast!!
                    4 -> btcPrice = binding.price.string().trim()
                }
                currentFee = if (linkEntityNew?.link == "BTC") {
                    if (binding.inputTransferAmount.string().isNotEmpty()) BTCUtils.getBTCGasInfo(linkEntityNew?.address!!, btcPrice, binding.inputTransferAmount.string())
                    else {
                        return@doHttp
                    }
                } else BTCUtils.getBTCTokenGasInfo(linkEntityNew?.address!!, btcPrice)

                binding.absenteeismFee.text = currentFee + unit
                binding.money.text = "$symbol${getNoMoreThanEightDigits(currentFee?.toDouble()!! * mainLinkPrice?.toDouble()!! * rate)}"

            } else if (linkEntityNew!!.link != "DOT") {
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
                    4 -> currentGasPrice = (binding.price.string().trim().toDouble() * 10.0.pow(9)).toString()

                }
                currentFee = ETHChain.getInstance().getGasInfo(currentGasPrice, gasLimit)
                binding.absenteeismFee.text = "${currentFee}$unit"
                binding.money.text = "$symbol${getNoMoreThanEightDigits(currentFee?.toDouble()!! * mainLinkPrice?.toDouble()!! * rate)}"
            }
        }
    }

    private fun send() {
        var credentials: Credentials? = null
        loading?.show()
        lifecycleScope.doHttp({
            if (linkEntityNew?.link != "BTC" && linkEntityNew?.channel != "OMNI") {
                credentials = ETHUtils.getCredentialsByPrvKey(String(linkEntityNew?.privateKey!!))
            } else {
                val hash = MySharedPreferences.getString("hash") ?: ""
                if (hash.isNotEmpty()) {
                    var status = BTCUtils.getStatus(hash)
                    if (status == 1) {//上一笔还在交易中
                        toast(getString(R.string.please_try), Gravity.CENTER)
                        loading?.cancel()
                        return@doHttp
                    }
                }
            }
            var hash = ""
            var result: ReturnsEntity? = null

            if (linkEntityNew?.channel?.isEmpty()!!) {
                when (linkEntityNew?.link) {
                    "DOT" -> {
                        result = DOTUtils.sendDOT(
                            String(linkEntityNew?.privateKey!!), linkEntityNew!!.address, binding.inputTransferAddress.string(), binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                        )
                    }
                    "ETH" -> {
                        result = ETHUtils.sendETH(
                            credentials!!, binding.inputTransferAddress.string(), binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                        )
                    }
                    "BTC" -> {
                        hash = BTCUtils.sendBtc(
                            String(linkEntityNew?.privateKey!!), binding.inputTransferAddress.string(), binding.inputTransferAmount.string(), currentFee
                        )
//                    BTCUtils.generateDig()
                    }
                    "BNB" -> {
                        result = BNBUtils.sendBNB(
                            credentials!!, binding.inputTransferAddress.string(), binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                        )
                    }
                    "HT" -> {
                        result = HTUtils.sendHT(
                            credentials!!, binding.inputTransferAddress.string(), binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                        )
                    }
                    "AVAX" -> {
                        result = AVAXUtils.sendAVAX(
                            credentials!!, binding.inputTransferAddress.string(), binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                        )
                    }
                    "MATIC" -> {
                        result = MATICUtils.sendMATIC(
                            credentials!!, binding.inputTransferAddress.string(), binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                        )
                    }
                }
            } else {
                when (linkEntityNew?.channel) {
                    "OMNI" -> hash = BTCUtils.sendBtcToken(
                        String(linkEntityNew?.privateKey!!), binding.inputTransferAddress.string(), binding.inputTransferAmount.string(), currentFee
                    )
                    "ERC20" -> result = ETHUtils.sendETHToken(
                        credentials!!, binding.inputTransferAddress.string(), linkEntityNew?.coinAddress!!, binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                    )
                    "BEP20" -> result = BNBUtils.sendBNBToken(
                        credentials!!, binding.inputTransferAddress.string(), linkEntityNew?.coinAddress!!, binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                    )
                    "HRC20" -> result = HTUtils.sendHTToken(
                        credentials!!, binding.inputTransferAddress.string(), linkEntityNew?.coinAddress!!, binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                    )
                    "MATIC" -> result = MATICUtils.sendMATICToken(
                        credentials!!, binding.inputTransferAddress.string(), linkEntityNew?.coinAddress!!, binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                    )
                    "AVAX C-Chain" -> result = AVAXUtils.sendAVAXToken(
                        credentials!!, binding.inputTransferAddress.string(), linkEntityNew?.coinAddress!!, binding.inputTransferAmount.string(), currentGasPrice!!, gasLimit
                    )
                    else -> ""
                }
            }

            if (linkEntityNew?.link == "BTC" || linkEntityNew?.channel == "OMNI") {
                //存储上一个交易hash
                if (hash.isNotEmpty()) {
                    MySharedPreferences.put("hash", hash)
                    toast(getString(R.string.trans_send))
                    startDeatil(hash)
                }
            } else {
                if (result?.code == 200) {
                    hash = result?.msg!!
                    toast(getString(R.string.trans_send))
                    startDeatil(hash)
                } else toast(result?.msg!!)
            }

            loading?.cancel()
        }, {
            toast(getString(R.string.trans_error))
            loading?.cancel()
        })
    }

    private fun startDeatil(hash: String) {
        start<TransferDetailActivity> {
            putExtra(
                "detail", HistoryItem(
                    (System.currentTimeMillis() / 1000L).toString(), to = binding.inputTransferAddress.string(), linkEntityNew?.address!!, (binding.inputTransferAmount.string().toDouble() * 10.0.pow(
                        linkEntityNew?.decimals!!
                    )).toString(), gasLimit, currentGasPrice, hash, "0"
                )
            )
            putExtra("link", linkEntityNew?.link)
            putExtra("channel", linkEntityNew?.channel)
            putExtra("decimals", linkEntityNew?.decimals)
            putExtra("fee", currentFee)
        }

        finish()

    }


}

