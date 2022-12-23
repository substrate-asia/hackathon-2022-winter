package com.polkadot.bt.ui.home

import android.content.Intent
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.util.Log
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.appbar.AppBarLayout
import com.polkadot.bt.R
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.data.*
import com.polkadot.bt.databinding.ValueFragmentBinding
import com.polkadot.bt.dialog.InputPasswordDialog
import com.polkadot.bt.dialog.WaitDialog
import com.polkadot.bt.dialog.WalletDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.module.wallet_connect.TimeoutCallback
import com.polkadot.bt.module.wallet_connect.WCController
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.observer.ObserverListener
import com.polkadot.bt.observer.ObserverManager
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.BaseFragment
import com.polkadot.bt.ui.backup.BackupMnemonicActivity
import com.polkadot.bt.ui.home.adapter.AssetsAdapter
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import splitties.fragments.start
import splitties.toast.toast
import splitties.views.imageResource
import kotlin.math.abs

/**
 * @author Heaven
 * @date 2022/8/4 11:11
 */
class ValueFragment : BaseFragment<ValueFragmentBinding>(), ObserverListener {
    private var adapter: AssetsAdapter? = null
    private var isEye: Boolean = true
    private var assets: Double = 0.0
    private var localValue: LocalValueEntityNew? = null
    var rate = 1.0
    var symbol = ""
    override fun initBinding(container: ViewGroup?) = ValueFragmentBinding.inflate(layoutInflater, container, false)

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden)
            StatusBarUtil.setDarkMode(requireActivity())
    }

    override fun init() {
        StatusBarUtil.setDarkMode(requireActivity())

        ObserverManager.instance.add(this)
        binding.tvTitle.text = "钱包名称ABC"

        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        adapter = AssetsAdapter(requireContext())
        binding.recyclerView.adapter = adapter
        isEye = MySharedPreferences.get(Constants.VALUE_IS_EYE, true)
        if (isEye) {
            binding.ivVisible.imageResource = R.drawable.main_view
            binding.tvAssets.text = "$symbol${getNoMoreThanTwoDigits(assets * rate)}"
        } else {
            binding.ivVisible.imageResource = R.drawable.main_hide
            binding.tvAssets.text = "*****"
        }


        initData()
        initListeners()


    }


    override fun onDestroy() {
        super.onDestroy()
        ObserverManager.instance.remove(this)
    }

    private fun initData() {
        //获取数据库的当前钱包
        lifecycleScope.doHttp {
            val currentId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
            localValue = ValueDatabaseNew.get(requireContext()).getValue(currentId)
            if (localValue?.linkList!!.isNotEmpty()) {
                adapter?.setData(localValue?.linkList!!)
                getRate()//获取汇率
                setValueData(localValue!!)
            } else {
                requireActivity().finish()
            }
        }
    }


    private fun initListeners() {
        binding.refresh.setOnRefreshListener {
            initData()
            it.finishRefresh()
        }

        binding.appBarLayout.addOnOffsetChangedListener(AppBarLayout.OnOffsetChangedListener { appBarLayout, verticalOffset ->

            val mAlpha = abs(verticalOffset / appBarLayout.totalScrollRange.toFloat())
            binding.tvAll.alpha = 1 - mAlpha
            binding.tvAssets.alpha = 1 - mAlpha
            binding.ivVisible.alpha = 1 - mAlpha
            if ((1 - mAlpha) == 0f) {
                binding.tvAll.gone()
                binding.tvAssets.gone()
                binding.ivVisible.gone()
            } else {
                binding.tvAll.visible()
                binding.tvAssets.visible()
                binding.ivVisible.visible()
            }
        })


        binding.ivMenu.setOnClickListener {
            lifecycleScope.launch {
                if (binding.ivMenu.isClickable) {
                    binding.ivMenu.isClickable = false

                    val listValue = ValueDatabaseNew.get(requireContext()).getAllValue()
                    val dialog = WalletDialog(requireContext(), listValue!!)
                    dialog.onItemChangeClick = {
                        initData()
                    }
                    dialog.show()
                }
                delay(2000)
                binding.ivMenu.isClickable = true
            }
        }


        binding.ivVisible.setOnClickListener {
            if (isEye) {
                binding.ivVisible.imageResource = R.drawable.main_hide
                binding.tvAssets.text = "*****"
                MySharedPreferences.put(Constants.VALUE_IS_EYE, false)
                isEye = false
                adapter?.setHide()
            } else {
                binding.ivVisible.imageResource = R.drawable.main_view
                binding.tvAssets.text = "$symbol${getNoMoreThanTwoDigits(assets * rate)}"
                MySharedPreferences.put(Constants.VALUE_IS_EYE, true)
                isEye = true
                adapter?.setEye()
            }

        }
        val startScanActivity = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            if (it.data != null && it.resultCode == Constants.SCAN_RESULT) {
                val scanText = it.data?.getStringExtra(ScanActivity.OUT_PARAM_SEARCH_RESULT)
                if (scanText!!.startsWith("wc:")) {
                    requireView().postDelayed({
                        WCController.connect(scanText, 0, object :
                            TimeoutCallback {
                            override fun timeout() {
                                WaitDialog.dismiss()
                                WCController.disConnect()
                                toast(requireContext().getString(R.string.connect_timeout))
                            }
                        })
                    }, 50)
                } else {
                    start<ScanResultActivity> {
                        putExtra("result", scanText)
                    }
                }
            }
        }
        binding.ivScan.setOnClickListener {
//            val balanc = DOTApiLibrary.INSTANCE.getBalance("https://polkadot.api.onfinality.io/public-rpc", "https://polkadot.subscan.io", "13wNbioJt44NKrcQ5ZUrshJqP7TKzQbzZt5nhkeL4joa3PAX")
//            HttpUtils.doHttp {
//                val fetchTransactionDetail = DOTUtils.fetchTransactionDetail("0x3d8c531fe52dfda116c2988fcc7728cbc19543a7ea713812c0a7f5501f815cbe")
//                ToastUtils.showShort(fetchTransactionDetail)
//            }
            startScanActivity.launch(Intent(requireContext(), ScanActivity::class.java).setAction(ScanActivity.ACTION_SEARCH))
        }
        binding.ivClose.setOnClickListener {
//            binding.rlTips.visibility= View.GONE
            AnimationUtil.with()!!.moveToViewTop(binding.rlTips, 400)
        }
        binding.ivAdd.setOnClickListener {
            start<AddCoinActivity>()
        }
        binding.tvBackup.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
                MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) == true &&
                Utils.hasBiometricEnrolled(requireContext())
            ) {
                Utils.useFingerprint(requireContext(), object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        // 5次属于错误
                        Log.i(BaseActivity.TAG, "onAuthenticationError $errString")
                    }

                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        // 成功
                        Log.i(BaseActivity.TAG, "onAuthenticationSucceeded $result")
                        start<BackupMnemonicActivity> {
                            putExtra("isBackup", localValue?.isBackup)
                            putExtra("id", localValue?.id)
                        }
                    }

                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        // 单次失败
                        Log.i(BaseActivity.TAG, "onAuthenticationFailed ")
                    }
                })
            } else {
                InputPasswordDialog(requireContext()) {
                    if (it == localValue?.password) {
                        start<BackupMnemonicActivity> {
                            putExtra("isBackup", localValue?.isBackup)
                            putExtra("id", localValue?.id)
                        }
                    } else
                        toast(getString(R.string.password_error))
                }.show()
            }
        }
    }

    //切换钱包数据刷新
    private fun setValueData(localValueEntityNew: LocalValueEntityNew) {
//        binding.rlTips.visibility=if (localValueEntity.isBackup||localValueEntity.mnemonic.isEmpty())View.GONE else View.VISIBLE
        if (localValueEntityNew.isBackup || localValueEntityNew.mnemonic.isEmpty()) {
            AnimationUtil.with()!!.moveToViewTop(binding.rlTips, 400)
        } else {
            AnimationUtil.with()!!.topMoveToViewLocation(binding.rlTips, 400)
        }
        //单链BTC钱包不添加代币
        binding.ivAdd.visibleOrGone(!(localValueEntityNew.mnemonic.isEmpty() && localValueEntityNew.linkList[0].link == "BTC"))
        binding.tvTitle.text = localValueEntityNew.name
        var total = 0.0
        if (isEye) binding.tvAssets.text = "0"
        val listLink = adapter?.getData()
        for (i in 0 until listLink?.size!!) {
            val link = listLink[i]
            lifecycleScope.doHttp {
                val price = HttpUtils.linkApi.getPrice(link.link)
                link.linkPrice = if (price.current_price.isNullOrEmpty()) "0.0" else price.current_price
//              adapter?.notifyItemChanged(i)
                if (link.linkPrice.toDouble()!! > 0 && link.linkNumber.toDouble()!! > 0) {
                    adapter?.changeMoney(i, symbol, rate)
                    total += link.linkNumber.toDouble() * link.linkPrice.toDouble()
                    assets = total
                    if (isEye) binding.tvAssets.text = "$symbol${getNoMoreThanTwoDigits(assets * rate)}"
                }
            }

            lifecycleScope.doHttp {
                link.linkNumber =
                    if (link.channel.isEmpty()) {
                        when (link.link) {
                            "DOT" -> DOTUtils.getDOTNumber(link.address)
                            "ETH" -> ETHUtils.getETHNumber(link.address)
                            "BTC" -> BTCUtils.getBtcNumber(link.address)
                            "BNB" -> BNBUtils.getBNBNumber(link.address)
                            "HT" -> HTUtils.getHTNumber(link.address)
                            "AVAX" -> AVAXUtils.getAVAXNumber(link.address)
                            "MATIC" -> MATICUtils.getMATICNumber(link.address)
                            else -> "0.0"
                        }
                    } else {
                        when (link.channel) {
                            "OMNI" -> BTCUtils.getBtcTokenNumber(link.address)
                            "ERC20" -> ETHUtils.getETHTokenNumber(link.address, link.coinAddress)
                            "BEP20" -> BNBUtils.getBNBTokenNumber(link.address, link.coinAddress)
                            "HRC20" -> HTUtils.getHTTokenNumber(link.address, link.coinAddress)
                            "MATIC" -> MATICUtils.getMATICTokenNumber(link.address, link.coinAddress)
                            "AVAX C-Chain" -> AVAXUtils.getAVAXTokenNumber(link.address, link.coinAddress)
                            else -> "0.0"
                        }
                    }

//             adapter?.notifyItemChanged(i)
                adapter?.changeNum(i)
                val linkNumberIsZero: Boolean = if (link.link == "DOT") {
                    val array = link.linkNumber.split(":")
                    array[0].toDouble() > 0 && array[1].toDouble() > 0
                } else {
                    link.linkNumber.toDouble() > 0
                }
                if (link.linkPrice.toDouble() > 0 && linkNumberIsZero) {
                    adapter?.changeMoney(i, symbol, rate)
                    total += (if (link.link == "DOT") link.linkNumber.split(":")[1].toDouble() else link.linkNumber.toDouble()) * link.linkPrice.toDouble()
                    assets = total
                    if (isEye) binding.tvAssets.text = "$symbol${getNoMoreThanTwoDigits(assets * rate)}"
                }
            }
        }
    }


    override fun observerUpData(count: String) {
        initData()
    }

    private fun getRate() {
        lifecycleScope.doHttp {
            val currency = MySharedPreferences.get("currency", "USD")
            binding.tvAll.text = getString(R.string.all_assets, currency)
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

}