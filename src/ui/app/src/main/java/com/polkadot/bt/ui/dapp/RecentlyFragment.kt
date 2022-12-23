package com.polkadot.bt.ui.dapp

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.request.RequestOptions
import com.google.gson.reflect.TypeToken
import com.polkadot.bt.R
import com.polkadot.bt.bean.RecentlyBean
import com.polkadot.bt.databinding.RecentlyFragmentBinding
import com.polkadot.bt.databinding.RecentlyItemBinding
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ext.addHistory
import com.polkadot.bt.ext.e
import com.polkadot.bt.ui.BaseFragment
import splitties.fragments.start

class RecentlyFragment private constructor() : BaseFragment<RecentlyFragmentBinding>() {

    companion object {
        fun newInstance(type: Int): RecentlyFragment {
            val fragment = RecentlyFragment()
            val bundle = Bundle()
            bundle.putInt("type", type)
            fragment.arguments = bundle
            return fragment
        }
    }

    private var type = 0
    private val adapter by lazy { ContentAdapter() }

    override fun initBinding(container: ViewGroup?) = RecentlyFragmentBinding.inflate(layoutInflater, container, false)

    override fun init() {
        type = arguments?.getInt("type", 0) ?: 0

        binding.content.layoutManager = GridLayoutManager(context, 5)
        binding.content.adapter = adapter

        requestData()
    }

    override fun onResume() {
        super.onResume()
        requestData()
    }

    private fun requestData() {
        val key = if (type == 0) "collection_item" else "recently_item"
        val item = MySharedPreferences.getString(key, "")
        if (item.isNullOrEmpty() || item == "[]") {
            binding.empty.isVisible = true
            binding.content.isVisible = false
            if (type == 0) {
                binding.empty.setCompoundDrawablesRelativeWithIntrinsicBounds(0, R.drawable.no_collection, 0, 0)
                binding.empty.setText(R.string.no_collection)
            } else {
                binding.empty.setCompoundDrawablesRelativeWithIntrinsicBounds(0, R.drawable.no_data, 0, 0)
                binding.empty.setText(R.string.none_data)
            }
        } else {
            try {
                val data = MySharedPreferences.gson.fromJson<MutableList<RecentlyBean>>(item, object : TypeToken<MutableList<RecentlyBean>>() {}.type)
                "$data".e()
                binding.empty.isVisible = false
                binding.content.isVisible = true
                adapter.notifyItemRangeRemoved(0, data.size)
                adapter.data.clear()
                adapter.data.addAll(data)
                adapter.notifyItemRangeChanged(0, data.size)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    inner class ContentAdapter : RecyclerView.Adapter<ContentAdapter.ViewHolder>() {

        val data = mutableListOf<RecentlyBean>()

        inner class ViewHolder(val binding: RecentlyItemBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = RecentlyItemBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val bean = data[holder.bindingAdapterPosition]
            Glide.with(holder.itemView.context)
                .load(bean.icon)
                .apply(RequestOptions().circleCrop().placeholder(R.drawable.shape_d8d8d8_circle_bg))
                .into(holder.binding.icon)
            holder.binding.title.text = bean.title
            holder.itemView.setOnClickListener {
                addHistory(bean.icon, bean.url, bean.title, bean.desc)
                start<WebViewActivity> {
                    putExtra("icon", bean.icon)
                    putExtra("title", bean.title)
                    putExtra("url", bean.url)
                    putExtra("desc", bean.desc)
                }
            }
        }

        override fun getItemCount(): Int {
            return if (data.size > 5) 5 else data.size
        }
    }
}
