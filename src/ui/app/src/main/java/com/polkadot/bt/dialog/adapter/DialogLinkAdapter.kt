package com.polkadot.bt.dialog.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.CoinBean

class DialogLinkAdapter(private val context: Context, private val mList: List<CoinBean>, currentLink: String) :
    RecyclerView.Adapter<DialogLinkAdapter.MyViewHolder>() {
    lateinit var onItemClick:(data: String) ->Unit
    private var checkIndex=when(currentLink){
        "ETH"-> 0
        "BNB"-> 1
        "AVAX"-> 2
        "MATIC"-> 3
        else ->0
    }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.link_dialog_item, parent, false)
        )
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.tvLink.text=mList[position].fullName
        holder.tvLink.background=context.getDrawable(if (checkIndex==position)R.drawable.corners2_gray2 else R.drawable.corners2_gray)
        holder.tvLink.setOnClickListener {
            if (position!=checkIndex){
                val oldIndex = checkIndex
                checkIndex = holder.bindingAdapterPosition
                notifyItemChanged(oldIndex)
                notifyItemChanged(checkIndex)
                onItemClick.invoke(mList[position].name)
            }
        }
    }

    fun getData(): List<CoinBean>{
        return mList
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvLink: TextView = itemView.findViewById(R.id.tv_link)
    }
}

