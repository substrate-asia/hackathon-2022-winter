package com.polkadot.bt.ui.backup.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import java.util.ArrayList

class ConfirmEditBackupAdapter(private val context: Context, private val clearClick: OnClearClick) :
    RecyclerView.Adapter<ConfirmEditBackupAdapter.MyViewHolder>() {
    private var mList: ArrayList<HashMap<String, Boolean>> = arrayListOf()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_mnemonic_edit, parent, false)
        )
    }

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: ArrayList<HashMap<String, Boolean>>){
        mList = list
        notifyDataSetChanged()
    }

    @SuppressLint("NotifyDataSetChanged")
    fun addData(map: HashMap<String, Boolean>){
        mList.add(map)
        notifyDataSetChanged()
    }

    fun getData(): ArrayList<HashMap<String, Boolean>> {
        return mList
    }

    @SuppressLint("SetTextI18n", "NotifyDataSetChanged")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val data = mList[position]
        var key = ""
        for (s in data.keys){
            key = s
        }
        holder.tvMnemonic.text = key
        holder.tvMnemonic.setBackgroundResource(if (data[key] == true) R.drawable.corners5_primary else R.drawable.corners5_red)
        holder.ivClear.visibility = if (data[key] == true) View.GONE else View.VISIBLE
        holder.ivClear.setOnClickListener {
            clearClick.click()
            mList.removeLast()
            notifyDataSetChanged()
        }
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvMnemonic: TextView = itemView.findViewById(R.id.tvMnemonic)
        val ivClear: ImageView = itemView.findViewById(R.id.ivClear)
    }
}
interface OnClearClick{
    fun click()
}

