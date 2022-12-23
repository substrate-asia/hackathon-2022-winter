package com.polkadot.bt.dialog

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.os.Handler
import android.view.View
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import bchain.entity.GenerateEntity
import com.polkadot.bt.R
import com.polkadot.bt.bean.CoinBean
import com.polkadot.bt.data.BTCUtils
import com.polkadot.bt.data.DOTUtils
import com.polkadot.bt.dialog.adapter.CreateAdapter
import com.polkadot.bt.ext.toast
import utils.GenerateWalletKeyUtil
import java.io.File

@SuppressLint("SetTextI18n")
class CreateDialog(context: Context, list: List<CoinBean>, mnemonic: String, private val countDown: CountDownCallback) : Dialog(context, R.style.MBottomSheetDialog) {
    private val coinList = arrayListOf<CoinBean>()
    private var adapter: CreateAdapter? = null
    private val mHandler = Handler()
    private var typeList = arrayListOf<String>()
    private var file: File? = null
    private var count = 0

    private val createTimer = object : Runnable {
        override fun run() {
            coinList[count].isCreated = true
            count++
            for (index in coinList.indices) {
                coinList[index].isLoading = count == index
            }
            adapter?.notifyDataSetChanged()

            if (coinList.size == count) {
                try {
                    if (mnemonic.isNotEmpty()) {
                        val map = GenerateWalletKeyUtil().importMnemonics(BTCUtils.initParam(), file?.absolutePath, mnemonic, typeList.toTypedArray())
                        map.get("DOT")?.let {
                            val generateDotEntity = DOTUtils.newAccountWithMnemonic(mnemonic)
                            it.privateKey = generateDotEntity.privateKey
                            it.address = generateDotEntity.address
                        }
                        countDown.callback(map)
                    } else {
                        val map = GenerateWalletKeyUtil().generateWallet(BTCUtils.initParam(), file?.absolutePath, typeList.toTypedArray())
                        map.get("DOT")?.let {
                            val generateDotEntity = DOTUtils.newAccountWithMnemonic(it.mnemonics)
                            it.privateKey = generateDotEntity.privateKey
                            it.address = generateDotEntity.address
                        }
                        countDown.callback(map)
                    }
                    dismiss()
                } catch (e: Exception) {
                    e.printStackTrace()
                    toast(context.getString(R.string.failure))
                    dismiss()
                }

            } else
                mHandler.postDelayed(this, 2000)
        }
    }

    init {
        val view = View.inflate(context, R.layout.dialog_create, null)

//        val layoutManager = LinearLayoutManager(context, RecyclerView.HORIZONTAL, false)
        val layoutManager = GridLayoutManager(context, 3)
        val recyclerView = view.findViewById<RecyclerView>(R.id.recyclerView)
        recyclerView.layoutManager = layoutManager
        list.forEach {
            if (it.isChecked)
                coinList.add(it)
        }
        adapter = CreateAdapter(context, coinList)
        recyclerView.adapter = adapter

        setContentView(view)
        setCancelable(false)
        setCanceledOnTouchOutside(false)

        createValue()
    }

    private fun createValue() {
        file = File(context.filesDir, "value/")
        if (file?.exists() == false)
            file?.mkdirs()
        coinList.forEach {
            it.isCreated = false
            it.isLoading = false
            typeList.add(it.name)
        }
        coinList[0].isLoading = true
        mHandler.postDelayed(createTimer, 2000)
    }

    override fun dismiss() {
        mHandler.removeCallbacks(createTimer)
        super.dismiss()
    }
}

interface CountDownCallback {
    fun callback(info: HashMap<String, GenerateEntity>)
}