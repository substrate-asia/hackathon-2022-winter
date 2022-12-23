package com.polkadot.bt.ui.backup.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.RelativeLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R

class ConfirmBackupAdapter(private val context: Context, private val itemClick: OnItemClick) :
    RecyclerView.Adapter<ConfirmBackupAdapter.MyViewHolder>() {
    private var mList: List<String> = arrayListOf()
    private var currentItem: View? = null
    private var currentBg: View? = null
    private var currentText: View? = null
    var canClick = true

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_mnemonic_normal, parent, false)
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

    fun notifyItem(){
        canClick = true
        currentItem?.isEnabled = true
        currentBg?.isSelected = false
        currentText?.isSelected = false
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.tvMnemonic.text = mList[position]
        holder.itemView.setOnClickListener {
            if (canClick) {
                holder.tvMnemonic.isSelected = true
                holder.rl.isSelected = true
                it.isEnabled = false
                currentItem = holder.itemView
                currentText = holder.tvMnemonic
                currentBg = holder.rl
                itemClick.click(mList[position])
            }
        }
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvMnemonic: TextView = itemView.findViewById(R.id.tvMnemonic)
        val rl: RelativeLayout = itemView.findViewById(R.id.rl)
    }
}

interface OnItemClick{
    fun click(mnemonic: String)
}

