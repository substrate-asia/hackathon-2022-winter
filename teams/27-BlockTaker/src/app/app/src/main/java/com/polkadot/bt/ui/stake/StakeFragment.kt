package com.polkadot.bt.ui.stake

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import com.blankj.utilcode.util.BarUtils
import com.blankj.utilcode.util.ToastUtils
import com.polkadot.bt.R
import com.polkadot.bt.bean.Validators
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.data.DOTUtils
import com.polkadot.bt.data.DOTUtils.toStringWithoutScientificNotation
import com.polkadot.bt.databinding.StakeFragmentBinding
import com.polkadot.bt.dialog.InputPasswordDialog
import com.polkadot.bt.dialog.TipsDialog
import com.polkadot.bt.dialog.WaitDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseFragment
import com.polkadot.bt.ui.BaseWebViewActivity
import com.polkadot.bt.ui.home.CollectionActivity
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import splitties.fragments.start

class StakeFragment : BaseFragment<StakeFragmentBinding>() {
    var currentPageIsStakeIn = true
    var currentValue = -1L
    var linkEntityNew: LinkEntityNew? = null
    var allBalance = 0.0
    var availableBalance = 0.0
    var boundBalance = 0.0
    var lockedBalance = 0.0
    var unbindingBalance = 0.0
    var retrievableBalance = 0.0
    var profitBalance = 0.0



    override fun initBinding(container: ViewGroup?) = StakeFragmentBinding.inflate(layoutInflater, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        lifecycleScope.doHttp {
            while (true) {
                refresh(false, false, 0)
                delay(15 * 1000)
            }
        }
    }

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden) {
            StatusBarUtil.setLightMode(requireActivity())
            BarUtils.transparentStatusBar(requireActivity())
            (binding.viewTopTabBk.layoutParams as ViewGroup.MarginLayoutParams).topMargin = StatusBarUtil.getStatusBarHeight(requireContext())
            lifecycleScope.doHttp {
                val currentId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                if (currentValue < 0 || currentId != currentValue) {
                    currentValue = currentId
                    refresh(true, true, 0)
                }
            }
        }
    }

    fun refresh(showProgress: Boolean, globalProgress: Boolean, delay: Long) {
        lifecycleScope.doHttp({
            if (showProgress) {
                if (globalProgress) {
                    WaitDialog.showRound()
                } else {
                    binding.layoutStakeIn.progressBar.visibility = View.VISIBLE
                    binding.layoutStakeOut.progressBar.visibility = View.VISIBLE
                }
            }

            if (delay > 0) {
                delay(delay)
            }

            //获取当前钱包的DOT
            val currentId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
            val localValue = ValueDatabaseNew.get(requireContext()).getValue(currentId)
            if (localValue?.linkList!!.isNotEmpty()) {
                localValue.linkList.forEach {
                    if (it.link == "DOT") {
                        linkEntityNew = it
                    }
                }
            } else {
                requireActivity().finish()
            }

            binding.layoutStakeIn.tvAddress.text = linkEntityNew!!.address.substring(0, 5) + "..." + linkEntityNew!!.address.substring(linkEntityNew!!.address.length - 5)
            binding.layoutStakeOut.tvAddress.text = binding.layoutStakeIn.tvAddress.text

            val number0 = DOTUtils.getDOTNumber(linkEntityNew!!.address)
            val array0 = number0.split(":")
            availableBalance = array0[0].toDouble()
            val number = DOTUtils.getAccountStatus(linkEntityNew!!.address)
            val array = number.split(":")
            boundBalance = array[1].toDouble()
            allBalance = array[0].toDouble()
            lockedBalance = array[2].toDouble()
            unbindingBalance = array[3].toDouble()
            val fd = HttpUtils.createApi(Constants.POLKADOT_OPTION_BASE_URL).getRetrievableAmount(linkEntityNew!!.address)
            if (!fd.isSuccessful) {
//                requireActivity().finish()
                retrievableBalance = 0.0
            } else {
                retrievableBalance = fd.body()!!.data.amount.toDouble()
            }

            profitBalance = 0.0
            binding.layoutStakeIn.tvAlreadyStakeAmount.text = boundBalance.toStringWithoutScientificNotation()
            binding.layoutStakeIn.tvBalanceValue.text = availableBalance.toStringWithoutScientificNotation()

            binding.layoutStakeOut.tvAlreadyStakeAmount.text = binding.layoutStakeIn.tvAlreadyStakeAmount.text
            binding.layoutStakeOut.tvBalanceValue.text = binding.layoutStakeIn.tvBalanceValue.text
            binding.layoutStakeOut.tvRedeemingValue.text = unbindingBalance.toStringWithoutScientificNotation() + " DOT"
            binding.layoutStakeOut.tvStakeRetrievableValue.text = retrievableBalance.toStringWithoutScientificNotation() + " DOT"
            binding.layoutStakeOut.tvProfitValue.text = profitBalance.toStringWithoutScientificNotation() + " DOT"
            binding.layoutStakeOut.tvStakeBalanceAndProfitValue.text = (boundBalance + unbindingBalance + profitBalance).toStringWithoutScientificNotation() + " DOT"

            binding.layoutStakeOut.etInput.setText(binding.layoutStakeOut.tvAlreadyStakeAmount.text.toString())

            if (showProgress) {
                if (globalProgress) {
                    WaitDialog.dismiss()
                } else {
                    binding.layoutStakeIn.progressBar.visibility = View.GONE
                    binding.layoutStakeOut.progressBar.visibility = View.GONE
                }
            }
        }, {
            ToastUtils.showShort("数据加载错误：${it.javaClass.simpleName}")
            if (showProgress) {
                if (globalProgress) {
                    WaitDialog.dismiss()
                } else {
                    binding.layoutStakeIn.progressBar.visibility = View.GONE
                    binding.layoutStakeOut.progressBar.visibility = View.GONE
                }
            }
            //requireActivity().finish()
        })
    }

    override fun init() {
        setupView()
        //提名
        binding.layoutStakeIn.tvBtnStakeIn.clickNoRepeat {
            if (binding.layoutStakeIn.etInput.text.isBlank()) {
                ToastUtils.showShort(getString(R.string.enter_binding_quantity))
                return@clickNoRepeat
            }
            if (binding.layoutStakeIn.etInput.text.toString().toDouble() < 1) {
                ToastUtils.showShort(getString(R.string.minimum_input_1dot))
                return@clickNoRepeat
            }
            if (binding.layoutStakeIn.etInput.text.toString().toDouble() > binding.layoutStakeIn.tvBalanceValue.text.toString().toDouble()) {
                ToastUtils.showShort(getString(R.string.exceeds_available_balance))
                return@clickNoRepeat
            }
            lifecycleScope.doHttp {
                WaitDialog.showRound()
                var validators: List<Validators>? = null
                if (lockedBalance == 0.0) {
                    //获取验证人列表
                    validators = getValidators()
                }
                val fee = if (lockedBalance == 0.0)
                    DOTUtils.bondAndNomiinateFee(String(linkEntityNew!!.privateKey), linkEntityNew!!.address, binding.layoutStakeIn.etInput.text.toString(), getFormatValidatorsListStr(validators!!))
                else
                    DOTUtils.bondExtraFee(String(linkEntityNew!!.privateKey), linkEntityNew!!.address, binding.layoutStakeIn.etInput.text.toString())

                WaitDialog.dismiss()
                StakeIn2Dialog(requireContext(), linkEntityNew!!.address, binding.layoutStakeIn.etInput.text.toString(), "${fee} DOT") {
                    InputPasswordDialog(requireContext()) {
                        lifecycleScope.launch {
                            val id = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                            val value = ValueDatabaseNew.get(requireContext()).getValue(id)
                            if (it == value?.password) {
                                if (lockedBalance == 0.0) {
                                    startBondAndNomiinate(validators!!)
                                } else {
                                    startBondExtra()
                                }
                            } else {
                                toast(R.string.password_error)
                            }
                        }
                    }.show()
                }.show()
            }
        }
        //解绑
        binding.layoutStakeOut.tvBtnStakeOut.clickNoRepeat {
            if (binding.layoutStakeOut.etInput.text.isBlank() || binding.layoutStakeOut.etInput.text.toString().toDouble() == 0.0) {
                ToastUtils.showShort(getString(R.string.no_amount_can_be_unbound))
                return@clickNoRepeat
            }
            lifecycleScope.doHttp {
                WaitDialog.showRound()
                val unbondblance = binding.layoutStakeOut.etInput.text.toString()
                val fee = DOTUtils.chillAndUnbondFee(String(linkEntityNew!!.privateKey), linkEntityNew!!.address, unbondblance)
                WaitDialog.dismiss()
                StakeOutDialog(requireContext(), binding.layoutStakeOut.etInput.text.toString(), "${fee} DOT") {
                    InputPasswordDialog(requireContext()) {
                        lifecycleScope.launch {
                            val id = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                            val value = ValueDatabaseNew.get(requireContext()).getValue(id)
                            if (it == value?.password) {
                                startChillAndUnbond()
                            } else {
                                toast(R.string.password_error)
                            }
                        }
                    }.show()
                }.show()
            }
        }
        //取回
        binding.layoutStakeOut.tvRetrieve.clickNoRepeat {
            if (retrievableBalance == 0.0) {
                ToastUtils.showShort(getString(R.string.nothing_can_be_retrieved))
                return@clickNoRepeat
            }
            lifecycleScope.doHttp {
                WaitDialog.showRound()
                val fee = DOTUtils.withDrawFee(String(linkEntityNew!!.privateKey), linkEntityNew!!.address)
                WaitDialog.dismiss()
                StakeOutRetrieveDialog(requireContext(), retrievableBalance.toString(), "${fee} DOT") {
                    InputPasswordDialog(requireContext()) {
                        lifecycleScope.launch {
                            val id = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                            val value = ValueDatabaseNew.get(requireContext()).getValue(id)
                            if (it == value?.password) {
                                withDraw()
                            } else {
                                toast(R.string.password_error)
                            }
                        }
                    }.show()
                }.show()
            }
        }
        //提取收益
        binding.layoutStakeOut.tvExtract.setOnClickListener {
            ToastUtils.showShort("待实现")
        }
        binding.layoutStakeOut.ivTips1.setOnClickListener {
            TipsDialog(requireContext(), getString(R.string.total_amount_of_bound_accounts_tips)).show()
        }
        binding.layoutStakeOut.ivTips2.setOnClickListener {
            TipsDialog(requireContext(), getString(R.string.redeeming_tips)).show()
        }
        binding.layoutStakeOut.ivTips3.setOnClickListener {
            TipsDialog(requireContext(), getString(R.string.retrievable_tips)).show()
        }

        binding.layoutStakeIn.ivAdd.setOnClickListener {
            startActivity(Intent(requireContext(), CollectionActivity::class.java).putExtra("address", linkEntityNew?.address))
        }
        binding.layoutStakeOut.ivAdd.setOnClickListener {
            binding.layoutStakeIn.ivAdd.performClick()
        }
        binding.layoutStakeIn.tvMax.clickNoRepeat {
            lifecycleScope.doHttp({
                WaitDialog.showRound()
                var validators: List<Validators>? = null
                if (lockedBalance == 0.0) {
                    //获取验证人列表
                    validators = getValidators()
                }
                val fee = if (lockedBalance == 0.0)
                    DOTUtils.bondAndNomiinateFee(String(linkEntityNew!!.privateKey), linkEntityNew!!.address, availableBalance.toStringWithoutScientificNotation(), getFormatValidatorsListStr(validators!!))
                else
                    DOTUtils.bondExtraFee(String(linkEntityNew!!.privateKey), linkEntityNew!!.address, availableBalance.toStringWithoutScientificNotation())

                if (fee == "0") {
                    ToastUtils.showShort("get gee error")
                    WaitDialog.dismiss()
                    return@doHttp
                }
                val max = availableBalance - fee.toDouble()
                binding.layoutStakeIn.etInput.setText(max.toStringWithoutScientificNotation())
                WaitDialog.dismiss()
            }, {
                WaitDialog.dismiss()
                ToastUtils.showShort("get gee error" + it.javaClass.simpleName)
            })

        }
        binding.tvTabStakeIn.clickNoRepeat {
            currentPageIsStakeIn = true
            setupView()
        }
        binding.tvTabStakeOut.clickNoRepeat {
            currentPageIsStakeIn = false
            setupView()
        }
    }

    private fun setupView() {
        binding.layoutStakeIn.root.visibility = if (currentPageIsStakeIn) View.VISIBLE else View.GONE
        binding.layoutStakeOut.root.visibility = if (!currentPageIsStakeIn) View.VISIBLE else View.GONE
        binding.tvTabStakeIn.text = getString(if (currentPageIsStakeIn) R.string.binding_dot else R.string.binding)
        binding.tvTabStakeIn.textColor(Color.parseColor(if (currentPageIsStakeIn) "#111111" else "#97979C"))
        binding.tvTabStakeOut.text = getString(if (!currentPageIsStakeIn) R.string.unbind_dot else R.string.unbind)
        binding.tvTabStakeOut.textColor(Color.parseColor(if (!currentPageIsStakeIn) "#111111" else "#97979C"))
    }

    private suspend fun getValidators(): List<Validators>? {
        val result = HttpUtils.createApi(Constants.POLKADOT_OPTION_BASE_URL).getPolkadotValidators(binding.layoutStakeIn.etInput.text.toString())
        if (!result.isSuccessful) {
            ToastUtils.showShort(getString(R.string.get_verifier_error))
            WaitDialog.dismiss()
            return null
        }
        if (result.body()!!.data == null || result.body()!!.data!!.isEmpty()) {
            ToastUtils.showShort(getString(R.string.unable_get_verifier_information))
            WaitDialog.dismiss()
            return null
        }
        return result.body()!!.data
    }

    private fun getFormatValidatorsListStr(validators: List<Validators>): String {
        val validatorAaddress = StringBuffer()
        validators.forEach {
            validatorAaddress.append("${it.address}:")
        }
        val validatorAaddressStr = validatorAaddress.substring(0, validatorAaddress.length - 1)
        return validatorAaddressStr
    }

    private fun getFormatValidatorsListStr1(validators: List<Validators>): String {
        val validatorAaddress1 = StringBuffer()
        validators.forEach {
            validatorAaddress1.append("\"${it.address}\",")
        }
        val validatorAaddressStr1 = validatorAaddress1.substring(0, validatorAaddress1.length - 1)
        return validatorAaddressStr1
    }

    private fun startBondAndNomiinate(validators: List<Validators>) {
        lifecycleScope.doHttp({
            WaitDialog.showRound()
            val validatorAaddressStr = getFormatValidatorsListStr(validators)
            val validatorAaddressStr1 = getFormatValidatorsListStr1(validators)

            val returnsEntity = DOTUtils.bondAndNomiinate(String(linkEntityNew!!.privateKey), linkEntityNew!!.address, binding.layoutStakeIn.etInput.text.toString(), validatorAaddressStr)

            if (returnsEntity.code == 200) {
                var requestBody: RequestBody = RequestBody.create(
                    "application/json; charset=utf-8".toMediaTypeOrNull(), "{" +
                            "\"stash_address\": \"${linkEntityNew!!.address}\"," +
                            "\"validator_address\":[${validatorAaddressStr1}]" +
                            "}"
                )
                val result = HttpUtils.createApi(Constants.POLKADOT_OPTION_BASE_URL).saveNominator(requestBody)
                refresh(true, false, 3000)
                showTipCard(returnsEntity.msg)
            } else {
                ToastUtils.showShort("Error：${returnsEntity.msg}")
            }
            WaitDialog.dismiss()
        }, {
            ToastUtils.showShort("Error：${it.javaClass.simpleName}")
            WaitDialog.dismiss()
        })
    }

    private fun startBondExtra() {
        lifecycleScope.doHttp({
            WaitDialog.showRound()
            val returnsEntity = DOTUtils.bondExtra(String(linkEntityNew!!.privateKey), linkEntityNew!!.address, binding.layoutStakeIn.etInput.text.toString())

            if (returnsEntity.code == 200) {
                refresh(true, false, 3000)
                showTipCard(returnsEntity.msg)
            } else {
                ToastUtils.showShort("Error：${returnsEntity.msg}")
            }
            WaitDialog.dismiss()
        }, {
            ToastUtils.showShort("Error：${it.javaClass.simpleName}")
            WaitDialog.dismiss()
        })
    }

    private fun startChillAndUnbond() {
        lifecycleScope.doHttp({
            WaitDialog.showRound()
            val unbondblance = binding.layoutStakeOut.etInput.text.toString()
            val returnsEntity = DOTUtils.chillAndUnbond(String(linkEntityNew!!.privateKey), linkEntityNew!!.address, unbondblance)

            if (returnsEntity.code == 200) {
                if (true) {
                    val result = HttpUtils.createApi(Constants.POLKADOT_OPTION_BASE_URL).cancelnominator(linkEntityNew!!.address)
                    var requestBody: RequestBody = RequestBody.create(
                        "application/json; charset=utf-8".toMediaTypeOrNull(), "{" +
                                "\"stash_address\": \"${linkEntityNew!!.address}\"," +
                                "\"amount\": \"${unbondblance}\"," +
                                "\"tx_hash\": \"${returnsEntity.msg}\"" +
                                "}"
                    )
                    val result1 = HttpUtils.createApi(Constants.POLKADOT_OPTION_BASE_URL).saveRetrievableAmout(requestBody)
                }
                refresh(true, false, 3000)
                showTipCard(returnsEntity.msg)
            } else {
                ToastUtils.showShort("Error：${returnsEntity.msg}")
            }
            WaitDialog.dismiss()
        }, {
            ToastUtils.showShort("Error：${it.javaClass.simpleName}")
            WaitDialog.dismiss()
        })
    }

    private fun withDraw() {
        lifecycleScope.doHttp({
            WaitDialog.showRound()
            val returnsEntity = DOTUtils.withDraw(String(linkEntityNew!!.privateKey), linkEntityNew!!.address)

            if (returnsEntity.code == 200) {
                if (true) {
                    val result = HttpUtils.createApi(Constants.POLKADOT_OPTION_BASE_URL).deleteRetrievableAmout(linkEntityNew!!.address)
                }
                refresh(true, false, 3000)
                showTipCard(returnsEntity.msg)
            } else {
                ToastUtils.showShort("Error：${returnsEntity.msg}")
            }
            WaitDialog.dismiss()
        }, {
            ToastUtils.showShort("Error：${it.javaClass.simpleName}")
            WaitDialog.dismiss()
        })
    }

    private fun showTipCard(hash: String) {
        binding.tvHash.text = hash
        binding.cardTips.setOnClickListener {
            val baseUrl = Constants.API_WEBVIEW_DOT
            start<BaseWebViewActivity> {
                putExtra("title", getString(R.string.transfer_detail))
                putExtra("url", baseUrl + hash)
            }
        }
        binding.cardTips.visibility = View.VISIBLE
        binding.cardTips.postDelayed({
            binding.cardTips.visibility = View.GONE
        }, 4000)
    }
}