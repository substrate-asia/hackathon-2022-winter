package com.polkadot.bt.dialog

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.view.Gravity
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.ext.screenWidth
import com.polkadot.bt.ui.channel.ImportActivity
import com.polkadot.bt.ui.create.CreateWalletActivity
import com.polkadot.bt.ui.home.adapter.ValueAdapter
import splitties.activities.start

@SuppressLint("SetTextI18n")
class WalletDialog(context: Context, list: List<LocalValueEntityNew>) : Dialog(context, R.style.MBottomSheetDialog) {
    private var adapter: ValueAdapter? = null
    init {
        val view = View.inflate(context, R.layout.dialog_wallet, null)
        view.findViewById<ImageView>(R.id.ivClose).setOnClickListener { dismiss() }
        view.findViewById<TextView>(R.id.tvCreate).setOnClickListener {
            context.start<CreateWalletActivity>()
            cancel()
        }
        view.findViewById<TextView>(R.id.tvImport).setOnClickListener {
            context.start<ImportActivity>()
            cancel()
        }
        val recyclerView=view.findViewById<RecyclerView>(R.id.recyclerView)
        recyclerView.layoutManager=LinearLayoutManager(context)
        adapter= ValueAdapter(context)
        recyclerView.adapter=adapter
        adapter?.onItemClick ={v,pos,data ->
//            context.start<ManageValueActivity>()
            onItemChangeClick.invoke(data)
            cancel()
        }
        adapter?.onItemClickManage={v,pos,data->
            cancel()
        }


        setContentView(view)
        adapter?.setData(list)

        initData()
        setCancelable(false)
        setCanceledOnTouchOutside(true)
    }

    private fun initData() {

//        adapter?.setData(arrayListOf("钱包名称A","钱包名称B","钱包名称C","钱包名称D","钱包名称E"))
    }
    lateinit var onItemChangeClick:(data:LocalValueEntityNew) ->Unit

    override fun show() {
        super.show()
        val params = window?.attributes
        params?.width = screenWidth
        params?.gravity = Gravity.BOTTOM
        window?.attributes = params
    }
}