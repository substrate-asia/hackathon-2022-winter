package com.polkadot.bt.ui.convert

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.databinding.ConvertHistoryActivityBinding
import com.polkadot.bt.databinding.SwapItemBinding
import com.polkadot.bt.room.SwapDatabase
import com.polkadot.bt.room.entities.SwapEntity
import com.polkadot.bt.ui.BaseActivity
import kotlinx.coroutines.launch
import splitties.activities.start

class ConvertHistoryActivity :BaseActivity<ConvertHistoryActivityBinding>() {
    override fun initBinding() = ConvertHistoryActivityBinding.inflate(layoutInflater)

    private var data= arrayListOf<SwapEntity>()

    override fun init() {
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = ContentAdapter()
        initData()
    }

    private fun initData(){
        lifecycleScope.launch {
           val list=SwapDatabase.get(this@ConvertHistoryActivity).getSwaps()
            if (list.isNotEmpty())
                data.addAll(list)
            binding.recyclerView.adapter?.notifyDataSetChanged()
        }

    }

    inner class ContentAdapter : RecyclerView.Adapter<ContentAdapter.ViewHolder>() {

        inner class ViewHolder(val binding: SwapItemBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val bind = SwapItemBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(bind)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            holder.binding.outName.text=data[position].fromSymbol
            holder.binding.inName.text=data[position].toSymbol
            holder.binding.outNum.text="${data[position].fromTokenAmount} ${data[position].fromSymbol}"
            holder.binding.inNum.text="${data[position].toTokenAmount} ${data[position].toSymbol}"

            holder.itemView.setOnClickListener {
                val swap=data[position]
                start<SwapDetailActivity> {
                    putExtra("swap",swap)
                }
            }

        }

        override fun getItemCount(): Int {
            return data.size
        }
    }


}