package com.polkadot.bt.ui.home.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.bean.CurrencyBean
import com.polkadot.bt.bean.LinkBean
import com.polkadot.bt.databinding.AddLinkItemBinding
import com.polkadot.bt.ext.gone
import com.polkadot.bt.ext.visible
import com.polkadot.bt.room.entities.LinkEntityNew

class HotCurrencyAdapter(private val context: Context): RecyclerView.Adapter<HotCurrencyAdapter.ViewHolder>(){
    inner class ViewHolder(val binding: AddLinkItemBinding) : RecyclerView.ViewHolder(binding.root)
    private var hotCurrencys: List<LinkBean> = arrayListOf()
    private var linkList: List<LinkEntityNew> = arrayListOf()
    private var adapter:ContentAdapter?=null
    lateinit var onClickMore:(v: View, pos:Int, data: LinkBean) ->Unit
    lateinit var onClickAdd:(v: View, pos:Int, data: CurrencyBean) ->Unit
    lateinit var onClickSub:(v: View, pos:Int, data: CurrencyBean) ->Unit
    private var key=""
    var mapPage=HashMap<Int,Int>()

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: List<LinkBean>, linkList: List<LinkEntityNew>){
        hotCurrencys = list
        this.linkList=linkList
        notifyDataSetChanged()
    }
    fun setData(list: List<LinkBean>, linkList: List<LinkEntityNew>, pos: Int){
        hotCurrencys = list
        this.linkList=linkList
        notifyItemChanged(pos)
    }
    fun setkey(key:String){
        this.key=key
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = AddLinkItemBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {

        holder.binding.recyclerViewCoin.layoutManager = LinearLayoutManager(context)
        adapter=ContentAdapter(context)
        holder.binding.recyclerViewCoin.adapter = adapter
        if (hotCurrencys[position].hot_list.isNotEmpty()){
            holder.binding.view1.visible()
            holder.binding.linkIcon.visible()
            holder.binding.linkIcon.text=hotCurrencys[position].name
            adapter?.setData(hotCurrencys[position].hot_list,linkList)
        }else{
            holder.binding.view1.gone()
            holder.binding.linkIcon.gone()
        }

        adapter?.onClickAdd={ v,position,data ->
            onClickAdd.invoke(v,position,data)
        }
        adapter?.onClickSub={ v,position,data ->
            onClickSub.invoke(v,position,data)

        }

        if (hotCurrencys[position].hot_list.size==5&&key.isNotEmpty()||hotCurrencys[position].isHaseMore){
            holder.binding.tvMore.visible()
        }else
            holder.binding.tvMore.gone()
        holder.binding.tvMore.setOnClickListener {
            onClickMore.invoke(it,position,hotCurrencys[position])
        }
    }

    override fun getItemCount(): Int {
        return hotCurrencys.size
    }

}