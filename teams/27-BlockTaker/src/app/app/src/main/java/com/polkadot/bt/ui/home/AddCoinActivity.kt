package com.polkadot.bt.ui.home

import android.annotation.SuppressLint
import android.view.KeyEvent
import android.view.inputmethod.EditorInfo
import androidx.core.view.isGone
import androidx.core.view.isVisible
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.polkadot.bt.R
import com.polkadot.bt.bean.LinkBean
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.databinding.AddCoinActivityBinding
import com.polkadot.bt.dialog.LoadingDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.observer.ObserverManager
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.create.AddCurrencyActivity
import com.polkadot.bt.ui.home.adapter.HotCurrencyAdapter
import kotlinx.coroutines.launch
import splitties.activities.start

/**
 * @author Heaven
 * @date 2022/8/9 13:28
 */
class AddCoinActivity : BaseActivity<AddCoinActivityBinding>() {

    private var key: String = ""
    private var page=1
    private var max=20 //单次最大条数
    private var refresh:Boolean=false
    private var adapterLink: HotCurrencyAdapter =HotCurrencyAdapter(this)
    private var hotCurrencys= mutableListOf<LinkBean>()
//    private var sigleList= arrayListOf<LinkBean>()
    private var currencyValue:LocalValueEntityNew?=null
    private var isSingleLink=false
    private var channelList= arrayListOf<String>()
    override fun initBinding() = AddCoinActivityBinding.inflate(layoutInflater)
    private var loading:LoadingDialog?=null
    var mapPage=HashMap<Int,Int>()
    var mapAddress=HashMap<String,String>()
    var mapKey=HashMap<String,String>()
    @SuppressLint("SetTextI18n")
    override fun init() {
//        initData()
        isSemiBold(binding.cancel, binding.hotCoin/*, binding.key*/)
        loading= LoadingDialog(this)
//        binding.key.text = "BTC、ETH"

        binding.content.layoutManager = LinearLayoutManager(this)
        binding.content.adapter = adapterLink

        binding.search.addTextChangedListener {
            if (it.toString().isNotEmpty()) {
                if (binding.mainChain.isVisible){
                    binding.mainChain.gone()
                    binding.hotCoin.gone()
                    binding.hintFilter.gone()
                }
                key=it.toString()
                search(key)
            } else {
                if (binding.mainChain.isGone&&!isSingleLink){
                    binding.mainChain.visible()
                    binding.hotCoin.visible()
                    binding.hintFilter.visible()
                }
                key = ""
                getHots()
            }
            adapterLink.setkey(key)
        }
        binding.search.setOnEditorActionListener { _, actionId, event ->
            val b = actionId == EditorInfo.IME_ACTION_SEARCH || actionId == EditorInfo.IME_ACTION_DONE || event != null && event.keyCode == KeyEvent.KEYCODE_ENTER
            if (b) {
                key = binding.search.string()
                adapterLink.notifyItemRangeChanged(0, adapterLink.itemCount)
                return@setOnEditorActionListener true
            }
            false
        }


        adapterLink.onClickMore={v,position,data ->
            if (key.isNotEmpty()){
             loading?.show()
                 mapPage[position]= mapPage[position]!! +1

            lifecycleScope.doHttp ({
                val mores=HttpUtils.linkApi.getMoreLinks(page= mapPage[position]!!,max=max,channel = data.name, name = key)
               val list= mores.list
                if (list!!.isEmpty()){
                     hotCurrencys[position].isHaseMore=false
                }else {
                    hotCurrencys[position].isHaseMore=list.size==max
                    hotCurrencys[position].hot_list = hotCurrencys[position].hot_list + list!!
                }
                    adapterLink.setData(hotCurrencys, currencyValue?.linkList!!,position)
                loading?.cancel()
            },{
                loading?.cancel()
            })
            }
        }

        adapterLink.onClickAdd={v,position,data ->
            lifecycleScope.doHttp {

                val address= when(data.channel){
                    "ERC20" -> mapAddress["ETH"]
                    "BEP20" -> mapAddress["BNB"]
                    "HRC20" ->mapAddress["HT"]
                    "MATIC" ->mapAddress["MATIC"]
                    "AVAX C-Chain" -> mapAddress["AVAX"]
                    else -> ""
                }
                val key= when(data.channel){
                    "ERC20" -> mapKey["ETH"]
                    "BEP20" -> mapKey["BNB"]
                    "HRC20" -> mapKey["HT"]
                    "MATIC" ->mapKey["MATIC"]
                    "AVAX C-Chain" -> mapKey["AVAX"]
                    else -> ""
                }

                ValueDatabaseNew.get(this@AddCoinActivity).addValueCurrency(LinkEntityNew(
                    id=0,
                    valueId = currencyValue?.id!!,
                    link=data.symbol,
                    icon =data.logo_url,
                    mnemonic = currencyValue?.mnemonic!!.toByteArray(),
                    privateKey = key!!.toByteArray(),
                    address = address!!,
                    linkId = currencyValue?.id.toString(),
                    fileName = "",
                    linkNumber = "0",
                    linkPrice = "0",
                    coinAddress = data.address,
                    isSelect = true,
                    channel=data.channel,
                    decimals = data.decimals
                ))
                toast(R.string.add_success)
                ObserverManager.instance.notifyObserver("")
            }
        }
        adapterLink.onClickSub={v,position,data ->
            lifecycleScope.launch {
                ValueDatabaseNew.get(this@AddCoinActivity).deleteCurrency(data.address,
                    currencyValue?.id!!,data.channel
                )
                toast(getString(R.string.remove_success))
                ObserverManager.instance.notifyObserver("")
            }
        }

        click(binding.cancel){
            if (key.isEmpty()) finish() else binding.search.setText("")

        }
        click(binding.mainChain){
            start<AddCurrencyActivity>{
                putExtra("isAdd",true)
            }
        }

        binding.refresh.setOnRefreshListener {
            page=1
//            getData()
            refresh=true
        }.setOnLoadMoreListener {
            page++
//            getData()
            refresh=false
        }


    }

    override fun onResume() {
        initData()
        getHots()
        super.onResume()
    }

    private fun initData(){
        lifecycleScope.launch {
            val currencyId=MySharedPreferences.get(Constants.CURRENT_VALUE,1L)
            currencyValue= ValueDatabaseNew.get(this@AddCoinActivity).getValue(currencyId)
            //判断单链钱包
            isSingleLink= currencyValue?.mnemonic!!.isEmpty()
            if (isSingleLink&&binding.mainChain.isVisible){
                binding.mainChain.gone()
                binding.hotCoin.gone()
                binding.hintFilter.gone()
            }
            currencyValue?.linkList?.forEach {
                if (it.channel.isEmpty()){
                    mapAddress[it.link] = it.address
                    mapKey[it.link]=String(it.privateKey)
                    when(it.link){
                        "ETH"-> channelList.add("ERC20")
                        "BNB"-> channelList.add("BEP20")
                        "HT"-> channelList.add("HRC20")
                        "AVAX"-> channelList.add("AVAX C-Chain")
                        "MATIC"-> channelList.add("MATIC")
                    }
                }
            }
        }
    }



    private fun getHots(){
        loading?.show()
        lifecycleScope.doHttp({
            val hots=HttpUtils.linkApi.getHotCurrency()
//            hotCurrencys.clear()
            if (hots.list?.isNotEmpty()!!){
            binding.empty.gone()
                val sigleList= arrayListOf<LinkBean>()
                hots.list!!.forEach {
                  if (channelList.contains(it.name)&&it.hot_list.isNotEmpty() ){
                      sigleList.add(it)

                  }
                }
                if (sigleList.isEmpty())
                    binding.empty.visible()
                else
                    adapterLink.setData(sigleList, currencyValue?.linkList!!)
            }else
                binding.empty.visible()
            loading?.cancel()
        },{
            loading?.cancel()
        })
    }

    private fun search(name:String){
        mapPage.clear()
        var hashData=false
        lifecycleScope.doHttp {
            val searchs=HttpUtils.linkApi.searchCurrency(name = name)

            for (i in 0 until searchs?.list!!.size) {
                mapPage[i]=0
                if (searchs?.list!![i].hot_list.isNotEmpty()){
                    hashData=true
                }
            }
            if (hashData){
                binding.empty.gone()
                hotCurrencys.clear()

                    searchs.list!!.forEach {
                        if (channelList.contains(it.name) &&it.hot_list.isNotEmpty() ){
                            hotCurrencys.add(it)
                        }
                    }
                    if (hotCurrencys.isEmpty())
                        binding.empty.visible()
                    else{
                        adapterLink.setData(hotCurrencys, currencyValue?.linkList!!)
                    }

            }else{
                binding.empty.visible()
                adapterLink.setData(arrayListOf(), arrayListOf())
            }
        }
    }


}