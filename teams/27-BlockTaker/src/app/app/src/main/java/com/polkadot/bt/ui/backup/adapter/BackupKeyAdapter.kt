package com.polkadot.bt.ui.backup.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.getMainLinkIcon
import com.polkadot.bt.ext.loadImage
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.view.CircleImageView

class BackupKeyAdapter(private val context: Context, private val itemClick: OnItemClickListener) :
    RecyclerView.Adapter<BackupKeyAdapter.MyViewHolder>() {
    private var mList: List<LinkEntityNew> = arrayListOf()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_backup_key, parent, false)
        )
    }

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: List<LinkEntityNew>){
        mList = list
        notifyDataSetChanged()
    }

    fun getData(): List<LinkEntityNew> {
        return mList
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        loadImage(context, getMainLinkIcon(mList[position].link),holder.linkIcon)
        holder.tvTitle.text = mList[position].link
        holder.itemView.setOnClickListener {
            itemClick.click(mList[position].link,String(mList[position].privateKey))
        }
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvTitle: TextView = itemView.findViewById(R.id.tvTitle)
        val linkIcon: CircleImageView =itemView.findViewById(R.id.link_icon)
    }
}

interface OnItemClickListener{
    fun click(type: String,key:String)
}

