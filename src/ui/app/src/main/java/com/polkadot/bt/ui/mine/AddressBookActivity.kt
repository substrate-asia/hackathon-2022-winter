package com.polkadot.bt.ui.mine

import android.app.Activity
import android.content.Intent
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.scwang.smart.refresh.layout.api.RefreshLayout
import com.scwang.smart.refresh.layout.listener.OnRefreshLoadMoreListener
import com.polkadot.bt.bean.getMainLinkIcon
import com.polkadot.bt.data.*
import com.polkadot.bt.databinding.AddressBookActivityBinding
import com.polkadot.bt.databinding.AddressBookItemBinding
import com.polkadot.bt.ext.gone
import com.polkadot.bt.ext.isSemiBold
import com.polkadot.bt.ext.loadImage
import com.polkadot.bt.ext.visible
import com.polkadot.bt.room.AddressDatabase
import com.polkadot.bt.room.entities.AddressEntity
import com.polkadot.bt.ui.BaseActivity
import kotlinx.coroutines.launch
import splitties.activities.start
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap

/**
 * @author Heaven
 * @date 2022/8/4 14:47
 */
class AddressBookActivity : BaseActivity<AddressBookActivityBinding>() {

    private val data = mutableListOf<AddressEntity>()
    private var isTransfer:Boolean=false

    override fun initBinding() = AddressBookActivityBinding.inflate(layoutInflater)

    override fun init() {
        binding.toolbar.setMoreListener {
            start<AddAddressBookActivity>()
        }

        binding.refresh.setOnRefreshLoadMoreListener(object : OnRefreshLoadMoreListener {
            override fun onRefresh(refreshLayout: RefreshLayout) {
                refreshLayout.finishRefresh()
                initData()
//                binding.content.adapter?.notifyItemRangeRemoved(0, data.size)
//                data.clear()
//                binding.content.adapter?.notifyItemInserted(0)
            }

            override fun onLoadMore(refreshLayout: RefreshLayout) {
                refreshLayout.finishLoadMore()
//                binding.content.adapter?.notifyItemInserted(data.size - 20)
            }
        })
        binding.content.layoutManager = LinearLayoutManager(this)
        binding.content.adapter = ContentAdapter()

        binding.refresh.gone()
    }


    override fun onResume() {
        initData()
        super.onResume()
    }

    private fun initData() {
        binding.refresh.visible()
        data.clear()
        lifecycleScope.launch {
           val list=AddressDatabase.get(this@AddressBookActivity).getAddress()
            if (list.isEmpty())
                binding.empty.visible()
            else{
                //相同的主链地址放在一起
                binding.empty.gone()
            val mapList=HashMap<String,List<AddressEntity>>()
                list.forEach {
                    val type=it.linkType
                    var listAddress= arrayListOf<AddressEntity>()
                    if (mapList.containsKey(type)){
                        listAddress= (mapList[type] as ArrayList<AddressEntity>?)!!
                    }
                    listAddress.add(it)
                    mapList[type]=listAddress
                }
                if (intent.getBooleanExtra("isTransfer",false)){
                    val link=intent?.getStringExtra("link")
                    if (mapList.containsKey(link))
                    data.addAll(mapList[link]!!)
                }else{
                    mapList.forEach {
                        data.addAll(it.value)
                    }
                }
            }
            binding.content.adapter?.notifyDataSetChanged()
        }
    }

    inner class ContentAdapter : RecyclerView.Adapter<ContentAdapter.ViewHolder>() {

        inner class ViewHolder(val binding: AddressBookItemBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val bind = AddressBookItemBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(bind)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            loadImage(this@AddressBookActivity, getMainLinkIcon(data[position].linkType),
                holder.binding.icon)
            holder.binding.address.isSemiBold()
            holder.binding.addressName.text = data[position].addressName
            holder.binding.address.text = data[position].addressContent
            if (data[position].describes.isNotEmpty()){
                holder.binding.desc.visible()
                holder.binding.desc.text = data[position].describes
            }else{
                holder.binding.desc.gone()
            }

            holder.itemView.setOnClickListener {
                if (intent.getBooleanExtra("isTransfer",false)){
                    setResult(Activity.RESULT_OK, Intent().putExtra("address",data[position].addressContent))
                    finish()
                    return@setOnClickListener
                }
                val entity=data[position]
                start<AddAddressBookActivity> {
                    this. putExtra("addressEntity",entity)
                    this. putExtra("isEdit",true)
                }

            }
        }

        override fun getItemCount(): Int {
            return data.size
        }
    }
}