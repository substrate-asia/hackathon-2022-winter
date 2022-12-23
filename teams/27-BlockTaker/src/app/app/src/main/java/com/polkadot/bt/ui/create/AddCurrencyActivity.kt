package com.polkadot.bt.ui.create

import android.content.Intent
import android.text.TextUtils
import android.util.Log
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import bchain.entity.GenerateEntity
import com.blankj.utilcode.util.ToastUtils
import com.polkadot.bt.R
import com.polkadot.bt.bean.CoinBean
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.bean.getMainLinks
import com.polkadot.bt.data.DOTUtils
import com.polkadot.bt.databinding.ActivityAddCurrencyBinding
import com.polkadot.bt.dialog.CountDownCallback
import com.polkadot.bt.dialog.CreateDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.observer.ObserverManager
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.channel.ImportActivity.Companion.MNEMONIC
import com.polkadot.bt.ui.channel.ImportRepeatActivity
import com.polkadot.bt.ui.create.adapter.AddCurrencyAdapter
import com.polkadot.bt.ui.create.adapter.OnItemClick
import com.polkadot.bt.ui.main.MainActivity
import kotlinx.coroutines.launch
import splitties.activities.start


class AddCurrencyActivity : BaseVBActivity<ActivityAddCurrencyBinding>() {
    private var adapter: AddCurrencyAdapter? = null
    private val mList: ArrayList<CoinBean> = arrayListOf()
    override fun initBinding() = ActivityAddCurrencyBinding.inflate(layoutInflater)
    private var isAdd = false
    private var currencyValue: LocalValueEntityNew? = null
    override fun init() {
        isAdd = intent?.getBooleanExtra("isAdd", false)!!


        binding.baseTitle.tvTitle.text = getString(R.string.add_chain)
        val layoutManager = LinearLayoutManager(this)
        binding.recyclerView.layoutManager = layoutManager
        adapter = AddCurrencyAdapter(this, object : OnItemClick {
            override fun click(list: List<CoinBean>) {
//                mList.clear()
//                mList.addAll(list)
                if (isAdd) binding.tvCreate.isEnabled = adapter?.getAddData()!!.isNotEmpty()
            }
        })
        binding.recyclerView.adapter = adapter
        initData()
        initListeners()
    }

    private fun initData() {
        mList.addAll(getMainLinks())
        adapter?.setData(mList)

        if (isAdd) {
            binding.tvCreate.isEnabled = false
            lifecycleScope.launch {
                val currencyId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                currencyValue = ValueDatabaseNew.get(this@AddCurrencyActivity).getValue(currencyId)
                currencyValue?.linkList?.forEach {
                    if (it.channel.isEmpty()) {
                        when (it.link) {
                            "HT" -> mList[3].isChecked = it.isSelect
                            "AVAX" -> mList[4].isChecked = it.isSelect
                            "MATIC" -> mList[5].isChecked = it.isSelect
                        }
                    }
                }
                adapter?.notifyItemRangeChanged(3, 3)
            }
        }
    }

    private fun initListeners() {
        binding.baseTitle.ivBack.setOnClickListener {
            finish()
        }
        binding.tvCreate.clickNoRepeat {
            val from = intent.getStringExtra("from") ?: ""
            val info = intent.getStringExtra("info") ?: ""
            val isFromMetaSpace = intent.getBooleanExtra("isFromMetaSpace", false)
            var mnemonic = replaceWhiteSpace(info)
            if (isAdd) {//添加主链 移除主链
                mnemonic = currencyValue?.mnemonic!!
                mList.clear()
                mList.addAll(adapter?.getAddData()!!)
            }
            lifecycleScope.doHttp {
                if (from == MNEMONIC && ValueDatabaseNew.get(this@AddCurrencyActivity).isValueExist(mnemonic, MNEMONIC, "")) {
                    start<ImportRepeatActivity>()
                } else {
                    //创建或导入逻辑
                    CreateDialog(this@AddCurrencyActivity, mList, mnemonic, object : CountDownCallback {
                        override fun callback(info: HashMap<String, GenerateEntity>) {
                            val linkList: MutableList<LinkEntityNew> = mutableListOf()
                            Log.e("Create or Import", info.toString())
                            info.forEach {
                                linkList.add(
                                    LinkEntityNew(
                                        id = 0,
                                        valueId = 0,
                                        link = it.key,
                                        icon = mList.let { list ->
                                            var icon = ""
                                            list.forEach { coin ->
                                                if (coin.name == it.key) {
                                                    icon = coin.icon.toString()
                                                }
                                            }
                                            icon
                                        },
                                        mnemonic = it.value.mnemonics.toByteArray(),
                                        privateKey = it.value.privateKey.toByteArray(),
                                        address = it.value.address,
                                        linkId = it.value.id.toString(),
                                        fileName = it.value.fileName,
                                        linkNumber = "0",
                                        linkPrice = "0",
                                        coinAddress = "",
                                        isSelect = true,
                                        channel = "",
                                        decimals = if (it.key == "DOT")
                                            DOTUtils.getDecimals()
                                        else
                                            18
                                    )
                                )

                                //创建钱包成功之后，比特币需要同步
                                //加入USDT
                                if (it.key == "BTC" && !isAdd) {

                                    linkList.add(
                                        LinkEntityNew(
                                            id = 0,
                                            valueId = 0,
                                            link = "USDT",
                                            icon = "https://s2.gongft.com/logo/1/tether.png?x-oss-process=style/coin_72",
                                            mnemonic = it.value.mnemonics.toByteArray(),
                                            privateKey = it.value.privateKey.toByteArray(),
                                            address = it.value.address,
                                            linkId = it.value.id.toString(),
                                            fileName = it.value.fileName,
                                            "0.0", "1.00000000", "", isSelect = true, channel = "OMNI"
                                        )
                                    )


                                    /* lifecycleScope.doHttp{
                                         val address=it.value.address
                                         val name=intent.getStringExtra("name")!!
                                         BTCUtils.sendAddressToNode(address,name )
                                     }*/
                                }
                            }
                            lifecycleScope.doHttp({
                                if (isAdd) {
                                    ValueDatabaseNew.get(this@AddCurrencyActivity).updateValueLink(
                                        currencyValue?.id!!, linkList
                                    )
                                    ObserverManager.instance.notifyObserver("")
                                    finish()
                                    return@doHttp
                                }

                                val id = ValueDatabaseNew.get(this@AddCurrencyActivity).insertValue(
                                    LocalValueEntityNew(
                                        0,
                                        intent.getStringExtra("name") ?: "",
                                        intent.getStringExtra("password") ?: "",
                                        info["BTC"]?.mnemonics ?: "",
                                        from == MNEMONIC,
                                        linkList
                                    )
                                )
                                MySharedPreferences.put(Constants.CURRENT_VALUE, id)
                                if (isFromMetaSpace && !TextUtils.isEmpty(mnemonic)) {
                                    //跳转myvertu
                                    val intent = Intent()
                                    intent.setClassName("com.vertu.life2", "com.vertu.myvertu.activity.WelcomeActivity")
                                    intent.putExtra("isFromMetaSpace", isFromMetaSpace)
                                    startActivity(intent)
                                    AppManager.getInstance().exit0()
                                    return@doHttp
                                }
                                if (from == MNEMONIC) {
                                    start<MainActivity>()
                                    AppManager.getInstance().finishALlActivityExceptClassName(MainActivity::class.java)
                                    val list = ValueDatabaseNew.get(this@AddCurrencyActivity).getAllValue()
                                    if (list.size > 1) {
                                        ObserverManager.instance.notifyObserver("更新钱包")
                                    }
                                } else {
                                    startActivity(
                                        Intent(this@AddCurrencyActivity, CreateSuccessActivity::class.java)
                                            .putExtra("isFromMetaSpace", isFromMetaSpace)
                                    )
                                    ObserverManager.instance.notifyObserver("更新钱包")
                                }
                                finish()
                            }, {
                                ToastUtils.showShort("_error")
                            })
                        }
                    }).show()
                }
            }
        }
    }


}