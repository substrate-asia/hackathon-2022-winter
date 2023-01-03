package com.polkadot.bt.ui.backup.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R

class BackupAdapter(private val context: Context) :
    RecyclerView.Adapter<BackupAdapter.MyViewHolder>() {
    private var mList: List<String> = arrayListOf()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_mnemonic, parent, false)
        )
    }

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: List<String>){
        mList = list
        notifyDataSetChanged()
    }

    fun getData(): List<String> {
        return mList
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.tvNum.text = (position + 1).toString()
        holder.tvMnemonic.text = mList[position]
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvNum: TextView = itemView.findViewById(R.id.tvNum)
        val tvMnemonic: TextView = itemView.findViewById(R.id.tvMnemonic)
    }
}

