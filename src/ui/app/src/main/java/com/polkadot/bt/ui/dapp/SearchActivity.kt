package com.polkadot.bt.ui.dapp

import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.request.RequestOptions
import com.scwang.smart.refresh.layout.api.RefreshLayout
import com.scwang.smart.refresh.layout.listener.OnRefreshLoadMoreListener
import com.polkadot.bt.R
import com.polkadot.bt.bean.DappContentBean
import com.polkadot.bt.databinding.DAppListItemBinding
import com.polkadot.bt.databinding.SearchActivityBinding
import com.polkadot.bt.ext.addHistory
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.ui.BaseActivity
import kotlinx.coroutines.launch
import splitties.activities.start

class SearchActivity : BaseActivity<SearchActivityBinding>() {

    private val adapter by lazy { ContentAdapter() }
    private var page = 1
    private val max = 20
    private var key = ""

    override fun initBinding() = SearchActivityBinding.inflate(layoutInflater)

    override fun init() {

        binding.content.layoutManager = LinearLayoutManager(this)
        binding.content.adapter = adapter

        binding.refresh.setOnRefreshLoadMoreListener(object : OnRefreshLoadMoreListener {
            override fun onRefresh(refreshLayout: RefreshLayout) {
                page = 1
                search()
            }

            override fun onLoadMore(refreshLayout: RefreshLayout) {
                page++
                search()
            }
        })

        binding.cancel.setOnClickListener { finish() }

        binding.search.setOnEditorActionListener { _, actionId, event ->
            val b = actionId == EditorInfo.IME_ACTION_SEARCH
                    || actionId == EditorInfo.IME_ACTION_DONE
                    || event != null && event.keyCode == KeyEvent.KEYCODE_ENTER
            key = binding.search.text.toString()
            if (b) {
                if (binding.search.text.contains(".")) {
                    val url = if (binding.search.text.startsWith("http")) binding.search.text else "https://${binding.search.text}"
                    start<WebViewActivity> {
                        putExtra("icon", "$url/favicon.ico")
                        putExtra("url", url)
                    }
                } else {
                    page = 1
                    search()
                }
                return@setOnEditorActionListener true
            }
            false
        }
    }

    private fun search() {
        lifecycleScope.launch {
            try {
                val response = HttpUtils.dappApi.query(key, page, max)
                if (response.isSuccessful) {
                    binding.refresh.finishRefresh()
                    binding.refresh.finishLoadMore()
                    response.body()?.let {
                        searchContentIsEmpty(true)
                        binding.refresh.setNoMoreData(it.count < max)
//                        adapter.prefix = it.image_prefix
                        val count = adapter.data.size
                        if (page == 1) {
                            adapter.data.clear()
                        }
                        adapter.data.addAll(it.list)
                        adapter.notifyDataSetChanged()
                    } ?: let {
                        if (page > 1) {
                            page--
                        } else {
                            searchContentIsEmpty(false)
                        }
                    }
                } else {
                    binding.refresh.finishLoadMore()
                    binding.refresh.finishRefresh()
                    if (page > 1) {
                        page--
                    } else {
                        searchContentIsEmpty(false)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                binding.refresh.finishLoadMore()
                binding.refresh.finishRefresh()
                if (page > 1) {
                    page--
                } else {
                    searchContentIsEmpty(false)
                }
            }
        }
    }

    private fun searchContentIsEmpty(visible: Boolean) {
        binding.refresh.isVisible = visible
        binding.emptyLayout.isVisible = !visible
    }

    inner class ContentAdapter : RecyclerView.Adapter<ContentAdapter.ViewHolder>() {

        val data = mutableListOf<DappContentBean>()
        var prefix = ""

        inner class ViewHolder(val binding: DAppListItemBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = DAppListItemBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val bean = data[holder.bindingAdapterPosition]
            val icon = bean.icon
            Glide.with(holder.itemView.context)
                .load(icon)
                .apply(RequestOptions().circleCrop().placeholder(R.drawable.shape_d8d8d8_circle_bg))
                .into(holder.binding.icon)
            holder.binding.title.text = bean.title
            holder.binding.desc.text = bean.desc
            holder.itemView.setOnClickListener {
                addHistory(icon, bean.link, bean.title, bean.desc)
                start<WebViewActivity> {
                    putExtra("icon", icon)
                    putExtra("title", bean.title)
                    putExtra("url", bean.link)
                    putExtra("desc", bean.desc)
                }
            }
        }

        override fun getItemCount(): Int {
            return data.size
        }
    }
}
