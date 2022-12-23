package com.polkadot.bt.ui.channel.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.CoinBean
import com.polkadot.bt.ext.loadImage

class WalletAdapter(private val context: Context, private val itemClick: OnItemClick) :
    RecyclerView.Adapter<WalletAdapter.MyViewHolder>() {
    private var mList: List<CoinBean> = arrayListOf()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_import_wallet, parent, false)
        )
    }

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: List<CoinBean>){
        mList = list
        notifyDataSetChanged()
    }

    fun getData(): List<CoinBean> {
        return mList
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.tvTitle.text = mList[position].name
        holder.tvTitleDesc.text = mList[position].fullName
        loadImage(context, mList[position].icon, holder.ivIcon)
        holder.itemView.setOnClickListener {
            itemClick.click(position)
        }
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val ivIcon: ImageView = itemView.findViewById(R.id.ivIcon)
        val tvTitle: TextView = itemView.findViewById(R.id.tvTitle)
        val tvTitleDesc: TextView = itemView.findViewById(R.id.tvTitleDesc)
    }
}

interface OnItemClick{
    fun click(position: Int)
}

