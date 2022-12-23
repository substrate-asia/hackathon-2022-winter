package com.polkadot.bt.ui.dapp

import android.content.Intent
import android.text.TextUtils
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentPagerAdapter
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.blankj.utilcode.util.BarUtils
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.RoundedCorners
import com.bumptech.glide.request.RequestOptions
import com.polkadot.bt.R
import com.polkadot.bt.bean.DappContentBean
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.databinding.DAppFragmentBinding
import com.polkadot.bt.databinding.DAppItemLayoutBinding
import com.polkadot.bt.databinding.DAppListItemBinding
import com.polkadot.bt.databinding.RecentlyItemBinding
import com.polkadot.bt.dialog.WaitDialog
import com.polkadot.bt.ext.Constants
import com.polkadot.bt.ext.addHistory
import com.polkadot.bt.ext.e
import com.polkadot.bt.module.wallet_connect.TimeoutCallback
import com.polkadot.bt.module.wallet_connect.WCController
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.ui.BaseFragment
import com.polkadot.bt.ui.home.ScanActivity
import com.polkadot.bt.ui.home.ScanResultActivity
import com.youth.banner.adapter.BannerImageAdapter
import com.youth.banner.holder.BannerImageHolder
import splitties.fragments.start
import splitties.toast.toast

/**
 * @author Heaven
 * @date 2022/9/13 14:03
 */
class DAppFragment : BaseFragment<DAppFragmentBinding>() {

    private val fragments = mutableListOf<Fragment>()
    private val titles = mutableListOf<String>()
    private val hotAdapter by lazy { HotAdapter() }

    override fun initBinding(container: ViewGroup?) = DAppFragmentBinding.inflate(layoutInflater, container, false)

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden) {
            StatusBarUtil.setLightMode(requireActivity())
            BarUtils.transparentStatusBar(requireActivity())
            (binding.root.layoutParams as ViewGroup.MarginLayoutParams).topMargin = StatusBarUtil.getStatusBarHeight(requireContext())
        }
    }

    override fun init() {
        titles.add(getString(R.string.collect))
        titles.add(getString(R.string.recently))
        fragments.add(RecentlyFragment.newInstance(0))
        fragments.add(RecentlyFragment.newInstance(1))
        binding.viewpager.adapter = PagerAdapter(childFragmentManager)
        binding.tabs.setupWithViewPager(binding.viewpager)

        binding.hotRecycler.layoutManager = GridLayoutManager(context, 5)
        binding.hotRecycler.adapter = hotAdapter

        binding.search.setOnClickListener {
            start<SearchActivity>()
        }

        val startScanActivity = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            if (it.data != null && it.resultCode == Constants.SCAN_RESULT) {
                val scanText = it.data?.getStringExtra(ScanActivity.OUT_PARAM_SEARCH_RESULT)
                if (scanText!!.startsWith("wc:")) {
                    requireView().postDelayed({ WCController.connect(scanText, 0, object : TimeoutCallback{
                        override fun timeout() {
                            WaitDialog.dismiss()
                            WCController.disConnect()
                            toast(requireContext().getString(R.string.connect_timeout))
                        }
                    }) }, 50)
                } else {
                    start<ScanResultActivity> {
                        putExtra("result", scanText)
                    }
                }
            }
        }
        binding.scan.setOnClickListener {
            startScanActivity.launch(Intent(requireContext(), ScanActivity::class.java).setAction(ScanActivity.ACTION_SEARCH))
        }

        binding.all.setOnClickListener {
            binding.tabs.selectedTabPosition.e()
            start<RecentlyActivity> { putExtra("type", binding.tabs.selectedTabPosition) }
        }

        requestBanner()
        requestHot()
        requestData()
    }

    private fun requestBanner() {
        lifecycleScope.doHttp {
            val response = HttpUtils.dappApi.dappBanner()
            if (response.isSuccessful) {
                response.body()?.let {
                    if (it.count == 0) {
                        val bean = DappContentBean()
                        it.list.add(bean)
                    }
                    binding.banner.addBannerLifecycleObserver(this@DAppFragment).setAdapter(object : BannerImageAdapter<DappContentBean>(it.list) {
                        override fun onBindView(holder: BannerImageHolder, bean: DappContentBean, position: Int, size: Int) {
//                            val icon = "${it.image_prefix}${bean.image ?: bean.content_image}"
                            Glide.with(holder.itemView)
                                .load(if (it.count == 0) R.drawable.banner else bean.image)
                                .apply(RequestOptions.bitmapTransform(RoundedCorners(5)).placeholder(R.drawable.shape_d8d8d8_placeholder_bg))
                                .into(holder.imageView)
                            /*holder.imageView.setOnClickListener {
                                addHistory(icon, bean.url, bean.title, bean.desc)
                                start<WebViewActivity> {
                                    putExtra("icon", icon)
                                    putExtra("title", bean.title)
                                    putExtra("url", bean.url)
                                    putExtra("desc", bean.desc)
                                }
                            }*/
                        }
                    }).start()
                }
            }
        }
    }

    private fun requestHot() {
        lifecycleScope.doHttp {
            val response = HttpUtils.dappApi.series()
            if (response.isSuccessful && (response.body()?.count ?: 0) > 0) {
                val result = HttpUtils.dappApi.seriesList(response.body()!!.list[0].id)
                if (result.isSuccessful) {
                    result.body()?.let {
//                        hotAdapter.prefix = it.image_prefix
                        hotAdapter.data.clear()
                        hotAdapter.data.addAll(it.list)
                        hotAdapter.notifyItemRangeChanged(0, it.count)
                    }
                }
            }
            /*if (response.isSuccessful) {
                response.body()?.let {
                    hotAdapter.prefix = it.image_prefix
                    hotAdapter.data.clear()
                    hotAdapter.data.addAll(it.list)
                    hotAdapter.notifyItemRangeChanged(0, it.count)
                }
            }*/
        }
    }

    private fun requestData() {
        lifecycleScope.doHttp {
            val response = HttpUtils.dappApi.category()
            if (response.isSuccessful) {
                response.body()?.let { bean ->
                    bean.list.forEach {
                        val content = HttpUtils.dappApi.categoryContent(it.id)
                        if (content.isSuccessful) {
                            content.body()?.let { contents ->
                                if (contents.list.isNotEmpty()) {
                                    val bind = DAppItemLayoutBinding.inflate(layoutInflater, null, false)
                                    bind.title.text = it.title
                                    bind.content.layoutManager = LinearLayoutManager(context)
                                    val adapter = ContentAdapter()
//                                    adapter.prefix = contents.image_prefix
                                    adapter.data.addAll(contents.list)
                                    bind.content.adapter = adapter
                                    adapter.notifyItemRangeChanged(0, contents.count)
                                    binding.layout.addView(bind.root)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        if (WCController.wcClient.isConnected) {
            WCController.wcClient.rejectSession()
            WCController.wcClient.disconnect()
        }
        super.onDestroy()
    }

    inner class HotAdapter : RecyclerView.Adapter<HotAdapter.ViewHolder>() {

        val data = mutableListOf<DappContentBean>()
        var prefix = ""

        inner class ViewHolder(val binding: RecentlyItemBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = RecentlyItemBinding.inflate(LayoutInflater.from(parent.context), parent, false)
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
            holder.itemView.setOnClickListener {
                if (!TextUtils.isEmpty(bean.link)) {
                    addHistory(icon, bean.link, bean.title, bean.desc)
                    start<WebViewActivity> {
                        putExtra("icon", icon)
                        putExtra("title", bean.title)
                        putExtra("url", bean.link)
                        putExtra("desc", bean.desc)
                    }
                }
            }
        }

        override fun getItemCount(): Int {
            return /*if (data.size > 5) 5 else */data.size
        }
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
                if (!TextUtils.isEmpty(bean.link)) {
                    addHistory(icon, bean.link, bean.title, bean.desc)
                    start<WebViewActivity> {
                        putExtra("icon", icon)
                        putExtra("title", bean.title)
                        putExtra("url", bean.link)
                        putExtra("desc", bean.desc)
                    }
                }
            }
        }

        override fun getItemCount(): Int {
            return data.size
        }
    }

    inner class PagerAdapter(fragmentManager: FragmentManager) : FragmentPagerAdapter(fragmentManager) {

        override fun getCount(): Int {
            return fragments.size
        }

        override fun getPageTitle(position: Int): CharSequence {
            return titles[position]
        }

        override fun getItem(position: Int): Fragment {
            return fragments[position]
        }
    }
}