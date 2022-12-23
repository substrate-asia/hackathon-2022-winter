package com.polkadot.bt.ui.channel.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R

class MnemonicAdapter(private val context: Context, private val itemClick: OnItemClick) :
    RecyclerView.Adapter<MnemonicAdapter.MyViewHolder>() {

    private var mList: ArrayList<String> = arrayListOf()
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_mnemonic_associate, parent, false)
        )
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.tvMnemonic.text = mList[position]
        holder.itemView.setOnClickListener {
            itemClick.click(position)
        }
    }

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: ArrayList<String>){
        mList = list
        notifyDataSetChanged()
    }

    fun getData(): ArrayList<String>{
        return mList
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvMnemonic: TextView = itemView.findViewById(R.id.tvMnemonic)
    }
}

