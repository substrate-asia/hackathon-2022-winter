package com.polkadot.bt.ui.home

import android.content.Intent
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.scwang.smart.refresh.layout.api.RefreshLayout
import com.scwang.smart.refresh.layout.listener.OnRefreshLoadMoreListener
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.R
import com.polkadot.bt.bean.HistoryBean
import com.polkadot.bt.bean.HistoryItem
import com.polkadot.bt.bean.getMainLinkIcon
import com.polkadot.bt.databinding.CurrencyIntroductionActivityBinding
import com.polkadot.bt.databinding.TransactionRecordActivityBinding
import com.polkadot.bt.dialog.LoadingDialog
import com.polkadot.bt.dialog.NormalDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.BaseWebViewActivity
import com.polkadot.bt.ui.backup.BackupMnemonicActivity
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import splitties.activities.start
import kotlin.math.pow

class CurrencyIntroductionActivity : BaseActivity<CurrencyIntroductionActivityBinding>() {

    override fun initBinding() = CurrencyIntroductionActivityBinding.inflate(layoutInflater)
    var linkEntityNew: LinkEntityNew? = null
    var adapter = ContentAdapter()
    private var page = 1
    private var size = 20
    private var refresh: Boolean = false
    var listHistory = mutableListOf<HistoryItem>()

    override fun init() {
        linkEntityNew = intent?.getSerializableExtra("link") as LinkEntityNew
        if (linkEntityNew?.channel!!.isEmpty())
            loadImage(this, getMainLinkIcon(linkEntityNew?.link!!), binding.icon)
        else loadImage(this, linkEntityNew?.icon!!, binding.icon)
        binding.currencyName.text = linkEntityNew?.link
        binding.address.text = "${linkEntityNew?.address?.substring(0, 7)}******${
            linkEntityNew?.address?.substring(linkEntityNew?.address!!.length - 7)
        }"
        if (linkEntityNew!!.link == "DOT") {
            val array = linkEntityNew?.linkNumber!!.split(":")
            binding.money.text = "${getNoMoreThanEightDigits(array[0]?.toDouble()!!)}/${getNoMoreThanEightDigits(array[1]?.toDouble()!!)}"
        } else {
            binding.money.text = "${getNoMoreThanEightDigits(linkEntityNew?.linkNumber?.toDouble()!!)}"
        }

        binding.currencyName.isSemiBold()
        binding.record.isSemiBold()
        binding.money.isSemiBold()
        binding.address.isSemiBold()
        binding.collection.isSemiBold()
        binding.transfer.isSemiBold()

        binding.content.layoutManager = LinearLayoutManager(this)
        binding.content.adapter = adapter

        binding.copy.setOnClickListener {
            copyToClipboard(this, linkEntityNew?.address!!)
        }

        binding.empty.setOnClickListener {
            getHistory()
        }

        binding.weblink.setOnClickListener {
            val baseUrl = when (linkEntityNew?.link) {
                "BTC" -> Constants.API_HISTORY_BTC
                "BNB" -> Constants.API_HISTORY_BNB
                else -> when (linkEntityNew?.channel) {
                    "BEP20" -> Constants.API_HISTORY_BNB
                    "OMNI" -> Constants.API_HISTORY_OMNI
                    else -> null
                }
            }
            start<BaseWebViewActivity> {
                putExtra("title", getString(R.string.transfer_detail))
                putExtra("url", baseUrl + linkEntityNew?.address)
            }
        }

        binding.refresh.setOnRefreshLoadMoreListener(object : OnRefreshLoadMoreListener {
            override fun onRefresh(refreshLayout: RefreshLayout) {
                page = 1
                getHistory()
                refresh = true
                refreshLayout.finishRefresh()
//                toast("refresh", Gravity.CENTER)
            }

            override fun onLoadMore(refreshLayout: RefreshLayout) {
                page++
                getHistory()
                refresh = false
                refreshLayout.finishLoadMore()
//                toast("load more", Gravity.TOP)

            }
        })

        binding.collection.setOnClickListener {
//            start<CollectionActivity>()
            startActivity(
                Intent(this, CollectionActivity::class.java)
                    .putExtra("address", linkEntityNew?.address)
            )
        }
        val valueId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)

        binding.transfer.setOnClickListener {
            lifecycleScope.launch {
                val currentValue = ValueDatabaseNew.get(this@CurrencyIntroductionActivity).getValue(valueId)
                if (!currentValue!!.isBackup && currentValue?.mnemonic?.isNotEmpty()!!) {
                    NormalDialog.build(this@CurrencyIntroductionActivity) {
                        confirmText = getString(R.string.backup_now)
                        confirmClick = {
                            start<BackupMnemonicActivity> {
                                putExtra("id", currentValue?.id)
                            }
                        }
                    }.show()
                } else {

                    /* if (linkEntity?.coinAddress!!.isNotEmpty()){
                         toast("代币转账还在调试中！！！")
                         return@launch
                     }*/
                    startActivity(
                        Intent(this@CurrencyIntroductionActivity, TransferActivity::class.java)
                            .putExtra("link", linkEntityNew)
                    )
                }
            }

        }

        lifecycleScope.launch {
            val currentValue = ValueDatabaseNew.get(this@CurrencyIntroductionActivity).getValue(valueId)
            if (!currentValue!!.isBackup && currentValue?.mnemonic?.isNotEmpty()!!) {
                NormalDialog.build(this@CurrencyIntroductionActivity) {
                    confirmText = getString(R.string.backup_now)
                    confirmClick = {
//                toast(getString(R.string.safe_tips))
                        start<BackupMnemonicActivity> {
                            putExtra("id", currentValue?.id)
                        }

                    }
                }.show()
            }
        }


        getHistory()
    }

    override fun onResume() {
//        getHistory()
        super.onResume()
    }


    private fun getHistory() {
        //暂时先让BTC BNB 跳转链接显示
        if (linkEntityNew?.link == "BTC" || linkEntityNew?.link == "BNB" || linkEntityNew?.channel == "OMNI" || linkEntityNew?.channel == "BEP20") {
            binding.weblink.visible()
            return
        }
        val loading = LoadingDialog(this)
        loading.show()
        lifecycleScope.doHttp({
            var result = when (linkEntityNew?.link) {
                "DOT" -> {
                    var requestBody: RequestBody = RequestBody.create(
                        "application/json; charset=utf-8".toMediaTypeOrNull(), "{" +
                                "\"row\": ${size}," +
                                "\"page\": ${page - 1}," +
                                "\"address\":\"${linkEntityNew!!.address}\"" +
                                "}"
                    )
                    val dotresult = HttpUtils.createApi(BuildConfig.DOT_HISTORY_URL).getDOTHistory(Constants.API_KEY_DOT, requestBody)
                    val newresult = HistoryBean(dotresult.message, mutableListOf<HistoryItem>().apply {
                        dotresult.data.transfers.forEach {
                            add(HistoryItem(it.block_timestamp, it.to, it.from, it.amount, it.fee, "", it.hash, ""))
                        }
                    }, dotresult.code.toString())
                    newresult
                }
                "ETH" -> HttpUtils.createApi(BuildConfig.ETH_HISTORY_URL).getHistory(action = "txlist", address = linkEntityNew!!.address, page = page, apikey = Constants.API_KEY_ETH)
                "BNB" -> HttpUtils.createApi(BuildConfig.BNB_HISTORY_URL).getHistory(action = "txlist", address = linkEntityNew!!.address, page = page, apikey = Constants.API_KEY_BNB)
                "HT" -> HttpUtils.createApi(BuildConfig.HT_HISTORY_URL).getHistory(action = "txlist", address = linkEntityNew!!.address, page = page)
                "AVAX" -> HttpUtils.createApi(BuildConfig.AVAX_HISTORY_URL).getHistory(action = "txlist", address = linkEntityNew!!.address, page = page, apikey = Constants.API_KEY_AVAX)
                "MATIC" -> HttpUtils.createApi(BuildConfig.MATIC_HISTORY_URL).getHistory(action = "txlist", address = linkEntityNew!!.address, page = page, apikey = Constants.API_KEY_MATIC)
                else -> when (linkEntityNew?.channel) {
                    "ERC20" -> HttpUtils.createApi(BuildConfig.ETH_HISTORY_URL)
                        .getHistory(action = "tokentx", contractaddress = linkEntityNew!!.coinAddress, address = linkEntityNew!!.address, page = page, apikey = Constants.API_KEY_ETH)
                    "BEP20" -> HttpUtils.createApi(BuildConfig.BNB_HISTORY_URL)
                        .getHistory(action = "tokentx", contractaddress = linkEntityNew!!.coinAddress, address = linkEntityNew!!.address, page = page, apikey = Constants.API_KEY_BNB)
                    "HRC20" -> HttpUtils.createApi(BuildConfig.HT_HISTORY_URL)
                        .getHistory(action = "tokentx", contractaddress = linkEntityNew!!.coinAddress, address = linkEntityNew!!.address, page = page)
                    "AVAX C-Chain" -> HttpUtils.createApi(BuildConfig.AVAX_HISTORY_URL)
                        .getHistory(action = "tokentx", contractaddress = linkEntityNew!!.coinAddress, address = linkEntityNew!!.address, page = page, apikey = Constants.API_KEY_AVAX)
                    "MATIC" -> HttpUtils.createApi(BuildConfig.MATIC_HISTORY_URL)
                        .getHistory(action = "tokentx", contractaddress = linkEntityNew!!.coinAddress, address = linkEntityNew!!.address, page = page, apikey = Constants.API_KEY_MATIC)
                    else -> null
                }
            }
            if (refresh)
                listHistory.clear()

            if (result?.result!!.isNotEmpty()) {
                binding.empty.gone()
                listHistory.addAll(result.result)
                listHistory.sortByDescending { it.timeStamp }//排序
                adapter.notifyDataSetChanged()

                if (result?.result!!.size < size)
                    binding.refresh.finishLoadMoreWithNoMoreData()
            } else {
                binding.empty.visible()
            }

            loading?.cancel()
        }, {
            binding.empty.visible()
            loading?.cancel()
        })
    }


    inner class ContentAdapter : RecyclerView.Adapter<ContentAdapter.ViewHolder>() {

        inner class ViewHolder(val binding: TransactionRecordActivityBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val bind = TransactionRecordActivityBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(bind)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            holder.binding.type.isSemiBold()
            holder.binding.money.isSemiBold()
            val date = if (listHistory[position].timeStamp.isNotEmpty()) transDate(listHistory[position].timeStamp) else ""
//            listHistory[position].timeStamp=date
            holder.binding.date.text = date

            val value = if (listHistory[position].value.isNotEmpty()){
                if (linkEntityNew!!.link == "DOT") {
                    listHistory[position].value
                }else{
                    "${getNoMoreThanEightDigits(listHistory[position].value.toDouble() / 10.0.pow(linkEntityNew?.decimals!!))}"
                }
            }else{
                ""
            }
//            listHistory[position].value=value
            if (linkEntityNew?.address == listHistory[position].from) {
                holder.binding.money.text = "- $value"
                holder.binding.type.text = getString(R.string.pay)
                holder.binding.type.background = getDrawable(R.drawable.shape_1b1b1c_corner_2_bg)
                if (listHistory[position].to.isEmpty())
                    listHistory[position].to = "0x0000000000000000000000000000000000000000"
                holder.binding.address.text = "${listHistory[position].to.substring(0, 9)}...${
                    listHistory[position].to.substring(listHistory[position].to.length - 9)
                }"
            } else {
                holder.binding.money.text = "+ $value"
                holder.binding.type.text = getString(R.string.funds)
                holder.binding.type.background = getDrawable(R.drawable.shape_b6915b_corner_2_bg)
                if (listHistory[position].from.isNotEmpty())
                    holder.binding.address.text = "${listHistory[position].from.substring(0, 9)}...${
                        listHistory[position].from.substring(listHistory[position].from.length - 9)
                    }"
            }
            holder.itemView.setOnClickListener {
                start<TransferDetailActivity> {
                    putExtra("detail", listHistory[position])
                    putExtra("link", linkEntityNew?.link)
                    putExtra("channel", linkEntityNew?.channel)
                    putExtra("decimals", linkEntityNew?.decimals)
                }
            }

        }

        override fun getItemCount(): Int {
            return listHistory.size
        }
    }
}
