package com.polkadot.bt.ui.create.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.CoinBean
import com.polkadot.bt.ext.loadImage

class AddCurrencyAdapter(private val context: Context, private val itemClick: OnItemClick) :
    RecyclerView.Adapter<AddCurrencyAdapter.MyViewHolder>() {
    private var mList: List<CoinBean> = arrayListOf()
    private var mAddList= arrayListOf<CoinBean>()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_add_currency, parent, false)
        )
    }

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: List<CoinBean>){
        mList = list
        notifyDataSetChanged()
    }

    fun getAddData(): List<CoinBean> {
        return mAddList
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.cb.isClickable = false
        holder.tvTitle.text = mList[position].name
        holder.tvTitleDesc.text = mList[position].fullName
        loadImage(context, mList[position].icon, holder.ivIcon)
        holder.cb.isChecked = mList[position].isChecked
        if (mList[position].isChecked){
            holder.cb.isEnabled=!mList[position].isChecked
            holder.itemView.isEnabled=false
        }

        holder.itemView.setOnClickListener {
            holder.cb.performClick()
            mList[position].isChecked = holder.cb.isChecked
            if (holder.cb.isChecked){
                mAddList.add(mList[position])
            }else{
               mAddList.remove(mList[position])
            }
            itemClick.click(mList)
        }
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val ivIcon: ImageView = itemView.findViewById(R.id.ivIcon)
        val tvTitle: TextView = itemView.findViewById(R.id.tvTitle)
        val tvTitleDesc: TextView = itemView.findViewById(R.id.tvTitleDesc)
        val cb: CheckBox = itemView.findViewById(R.id.cb)
    }
}

interface OnItemClick{
    fun click(list: List<CoinBean>)
}

