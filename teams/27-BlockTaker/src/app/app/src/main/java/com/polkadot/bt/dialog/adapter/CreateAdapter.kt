package com.polkadot.bt.dialog.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.CoinBean
import com.polkadot.bt.ext.loadImage
import com.polkadot.bt.ui.view.loadingdrawable.LoadingView

class CreateAdapter(private val context: Context, private val mList: List<CoinBean>) :
    RecyclerView.Adapter<CreateAdapter.MyViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_create, parent, false)
        )
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        loadImage(context, mList[position].icon, holder.ivIcon)
        holder.loadingView.visibility = if (mList[position].isLoading) View.VISIBLE else View.GONE
        holder.ivIcon1.visibility = if (mList[position].isCreated) View.GONE else View.VISIBLE
    }

    fun getData(): List<CoinBean>{
        return mList
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val ivIcon: ImageView = itemView.findViewById(R.id.ivIcon)
        val ivIcon1: ImageView = itemView.findViewById(R.id.ivIcon1)
        val loadingView: LoadingView = itemView.findViewById(R.id.loadingView)
    }
}

