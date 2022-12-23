package com.polkadot.bt.ui.convert

import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.text.InputFilter
import android.util.Log
import android.view.ViewGroup
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import com.blankj.utilcode.util.BarUtils
import com.polkadot.bt.R
import com.polkadot.bt.bean.Token
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.data.*
import com.polkadot.bt.databinding.ConvertFragmentBinding
import com.polkadot.bt.dialog.ConvertTypeDialog
import com.polkadot.bt.dialog.InputPasswordDialog
import com.polkadot.bt.dialog.LoadingDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.room.SwapDatabase
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.SwapEntity
import com.polkadot.bt.ui.BaseFragment
import kotlinx.coroutines.launch
import splitties.fragments.start
import kotlin.math.pow

class ConvertFragment:BaseFragment<ConvertFragmentBinding>() {

    private var checkedIndexOut:Token?=null
    private var checkedIndexIn:Token?=null
    private var currentTokens= arrayListOf<Token>()
    private  val OUT=0
    private  val IN=1
    private  var linkType=1
    private  var link="ETH"
    private var conver=0.0
    private var isEditOut=false
    private var isEditIn=false
    private var loadingDialog:LoadingDialog?=null
    private var dialog:ConvertTypeDialog?=null
    override fun initBinding(container: ViewGroup?) =ConvertFragmentBinding.inflate(layoutInflater, container, false)
    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden){
            StatusBarUtil.setLightMode(requireActivity())
            BarUtils.transparentStatusBar(requireActivity())
            (binding.toolbar.layoutParams as ViewGroup.MarginLayoutParams).topMargin = StatusBarUtil.getStatusBarHeight(requireContext())
        }
    }

    override fun init() {
         loadingDialog=LoadingDialog(requireContext())

        binding.toolbar.setMoreListener {
            start<ConvertHistoryActivity>()
        }
        binding.submit.clickNoRepeat {
//            binding.llError.visible()
//            TipsDialog(requireContext(), getString(R.string.exchange_not_support)).show()
//            binding.submit.isEnabled=false
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
                MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) == true &&
                Utils.hasBiometricEnrolled(requireContext())) {
                Utils.useFingerprint(requireContext(), object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        // 5次属于错误
                        Log.i(TAG, "onAuthenticationError $errString")
                    }
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        // 成功
                        Log.i(TAG, "onAuthenticationSucceeded $result")
                        swap()
                    }
                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        // 单次失败
                        Log.i(TAG, "onAuthenticationFailed ")
                    }
                })
            } else {
                InputPasswordDialog(requireContext()) {
                    lifecycleScope.launch {
                        val id = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                        val value = ValueDatabaseNew.get(requireContext()).getValue(id)
                        if (it == value?.password) {
                            swap()
                        } else {
                            toast(R.string.password_error)
                        }
                    }
                }.show()
            }
        }
        binding.toLinkSelect.clickNoRepeat { openCoinDialog(OUT) }
        binding.fromLinkSelect.clickNoRepeat { openCoinDialog(IN) }

        binding.fromAmount.addTextChangedListener {
            binding.submit.isEnabled=it.toString().isNotEmpty()
            if (it.toString().isNotEmpty()&&isEditOut){
                if (matcher(it!!).matches()) {
                    binding.fromAmount.filters = arrayOf(InputFilter.LengthFilter(it.toString().length + 8))
                }
                //  处理前排的0
                if (it.toString().length > 1 && it.toString()[0].toString()=="0" && it.toString()[1].toString()!="." ) {
                    it?.delete(0,1)
                }
                binding.toAmount.setText("${binding.fromAmount.string().toDouble()*conver }")
            }
        }
        binding.fromAmount.setOnFocusChangeListener { _, b -> isEditOut=b }
        binding.toAmount.setOnFocusChangeListener { _, b -> isEditIn=b }
        binding.toAmount.addTextChangedListener {
            if (it.toString().isNotEmpty()&&isEditIn){
                if (matcher(it!!).matches()) {
                    binding.toAmount.filters = arrayOf(InputFilter.LengthFilter(it.toString().length + 8))
                }
                //  处理前排的0
                if (it.toString().length > 1 && it.toString()[0].toString()=="0" && it.toString()[1].toString()!="." ) {
                    it?.delete(0,1)
                }
                binding.fromAmount.setText("${binding.toAmount.string().toDouble()/conver }")
            }
        }
        binding.ivExchange.setOnClickListener {

        }

        getCurrentTokens(Constants.SWAP_LINK_ETH)
    }



    private  fun openCoinDialog(type:Int){
        dialog= ConvertTypeDialog(requireContext(), currentTokens,
           (if (type==OUT)checkedIndexOut else checkedIndexIn)!!, type == OUT, link, { _, data ->
               setViewData(type,data)
               if (type==OUT){
                   checkedIndexOut=data
               }else{
                   checkedIndexIn=data
               }
           },{
               lifecycleScope.launch {
                   link=it
                   linkType=  when(it){
                       "ETH"->Constants.SWAP_LINK_ETH
                       "BNB"->Constants.SWAP_LINK_BNB
                       "AVAX"->Constants.SWAP_LINK_AVAX
                       "MATIC"->Constants.SWAP_LINK_MATIC
                       else ->1
                   }
                   currentTokens.clear()
                   getCurrentTokens(linkType)
               }
           }
       )
        dialog?.show()
    }

    private fun getCurrentTokens(linkType: Int){
        loadingDialog?.show()
        lifecycleScope.doHttp ({
           val listToken=HttpUtils.createApi(Constants.API_SWAP).swapTokens(linkType)
            if (listToken.tokens.isNotEmpty()){
                if (currentTokens.isEmpty()){
                    currentTokens.addAll(listToken.tokens.values)
                    checkedIndexOut=currentTokens[0]
                    checkedIndexIn=currentTokens[1]
                    setViewData(OUT,currentTokens[0])
                    setViewData(IN,currentTokens[1])
                }else{
                    currentTokens.clear()
                    currentTokens.addAll(listToken.tokens.values)
                }
            }
            dialog?.setDate(currentTokens)
            loadingDialog?.cancel()
        },{
            loadingDialog?.cancel()
        })
    }

    private fun setViewData(type: Int,data:Token){
        if (type==OUT){
            binding.linkName.text=data.symbol
            loadImage(requireContext(),data.logoURI,binding.linkIcon)
            balance(data)
        }else{
            binding.linkName2.text=data.symbol
            loadImage(requireContext(),data.logoURI,binding.linkIcon2)
        }
        rate()
    }

    /*
    * 余额
    * */
    private fun balance(fromToken: Token){

        lifecycleScope.doHttp {
            var  address=""
            val currencyId=MySharedPreferences.get(Constants.CURRENT_VALUE,1L)
            val value= ValueDatabaseNew.get(requireContext()).getValue(currencyId)
            value?.linkList?.forEach {
                if (it.channel.isEmpty()&&it.link==link){
                    address=it.address
                }
            }
          val balance=  when (link) {
            "ETH" -> ETHUtils.getETHTokenNumber(address,fromToken.address)
            "BNB" -> BNBUtils.getBNBTokenNumber(address,fromToken.address)
            "MATIC" -> MATICUtils.getMATICTokenNumber(address,fromToken.address)
            "AVAX" -> AVAXUtils.getAVAXTokenNumber(address,fromToken.address)
                else -> "0.0"
            }
          binding.linkNumber.text=balance

        }
    }

    /*
    * 估算
    * */
    private fun rate(){
        lifecycleScope.doHttp {
            val rate = HttpUtils.createApi(Constants.API_SWAP).quote(
                linkType,
                fromTokenAddress = checkedIndexOut?.address!!,
                toTokenAddress = checkedIndexIn?.address!!,
                amount = "10000000000000000"
            )
            if (rate.toTokenAmount.isNotEmpty()) {
                conver=rate.toTokenAmount.toDouble() / 10.0.pow(16)
                binding.tvRate.text = "1 ${checkedIndexOut?.symbol}≈${getNoMoreThanTwoDigits(conver)} ${checkedIndexIn?.symbol}"

            }
        }
    }

    /*
    * 闪兑
    * */

    private fun swap(){
        loadingDialog?.show()
        lifecycleScope.doHttp ({
            if (binding.fromAmount.string().isEmpty()){
                toast(R.string.money_null)
                loadingDialog?.cancel()
                return@doHttp
            }
            var  address=""
            val currencyId=MySharedPreferences.get(Constants.CURRENT_VALUE,1L)
            val value= ValueDatabaseNew.get(requireContext()).getValue(currencyId)
            value?.linkList?.forEach {
                if (it.channel.isEmpty()&&it.link==link){
                    address=it.address
                }
            }
            if (address.isEmpty()){
                toast(R.string.no_main_link)
                loadingDialog?.cancel()
                return@doHttp
            }
            val result=HttpUtils.createApi(Constants.API_SWAP).swap(linkType,
            fromTokenAddress = checkedIndexOut?.address!!,
            toTokenAddress = checkedIndexIn?.address!!,
            amount = binding.fromAmount.string()    ,
            fromAddress = address,
             slippage = 1
            )
            if (!result.fromTokenAmount.isNullOrEmpty()){
                toast(R.string.success)
                val swap=SwapEntity(
                    id = 0,
                    fromSymbol = result.fromToken.symbol,
                    toSymbol = result.toToken.symbol,
                    fromTokenAmount = result.fromTokenAmount,
                    toTokenAmount = result.toTokenAmount,
                    gas = result.tx.gas,
                    gasPrice = result.tx.gasPrice,
                    from = result.fromToken.address,
                    to=result.toToken.address,
                    value=result.tx.value,
                    time = System.currentTimeMillis()
                )
                SwapDatabase.get(requireContext()).insertSwap(swap)
                start<SwapDetailActivity> {
                    putExtra("swap",swap)
                }
            }
            loadingDialog?.cancel()
        },{
            toast(R.string.failure)
            loadingDialog?.cancel()
        })
    }


}