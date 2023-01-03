package com.polkadot.bt.ui.dapp

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.request.RequestOptions
import com.google.gson.reflect.TypeToken
import com.polkadot.bt.R
import com.polkadot.bt.bean.RecentlyBean
import com.polkadot.bt.databinding.DAppRecentlyItemBinding
import com.polkadot.bt.databinding.RecentlyActivityBinding
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ext.addHistory
import com.polkadot.bt.ext.e
import com.polkadot.bt.ext.isSemiBold
import com.polkadot.bt.ui.BaseActivity
import splitties.activities.start
import java.util.*

class RecentlyActivity : BaseActivity<RecentlyActivityBinding>() {

    private var type = 0
    private val touchHelperCallBack by lazy { TouchHelperCallBack() }

    override fun initBinding() = RecentlyActivityBinding.inflate(layoutInflater)

    override fun init() {

        isSemiBold(binding.title, binding.edit)

        type = intent.getIntExtra("type", 0)

        binding.title.setText(if (type == 0) R.string.my_collection else R.string.recently_use)

        binding.content.layoutManager = LinearLayoutManager(this)
        val adapter = ContentAdapter()
        binding.content.adapter = adapter
        touchHelperCallBack.setDragged(false)
        val itemTouchHelper = ItemTouchHelper(touchHelperCallBack)
        itemTouchHelper.attachToRecyclerView(binding.content)

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
                adapter.data.clear()
                adapter.data.addAll(data)
                adapter.notifyItemRangeChanged(0, data.size)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        binding.back.setOnClickListener { finish() }

        binding.edit.setOnClickListener {
            touchHelperCallBack.setDragged(false)
            binding.edit.isSelected = !binding.edit.isSelected
            binding.edit.setText(if (binding.edit.isSelected) R.string.complete else R.string.edit)
            adapter.edit = binding.edit.isSelected
            adapter.notifyItemRangeChanged(0, adapter.data.size)
            if (!binding.edit.isSelected) {
                MySharedPreferences.put(key, adapter.data)
            }
        }
    }

    inner class ContentAdapter : RecyclerView.Adapter<ContentAdapter.ViewHolder>() {

        val data = mutableListOf<RecentlyBean>()
        var edit = false

        inner class ViewHolder(val binding: DAppRecentlyItemBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = DAppRecentlyItemBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return ViewHolder(binding)
        }

        @SuppressLint("ClickableViewAccessibility")
        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val bean = data[holder.bindingAdapterPosition]
            Glide.with(holder.itemView.context)
                .load(bean.icon)
                .apply(RequestOptions().circleCrop().placeholder(R.drawable.shape_d8d8d8_circle_bg))
                .into(holder.binding.icon)
            holder.binding.title.text = bean.title
            holder.binding.desc.text = bean.desc

            holder.binding.delete.isVisible = edit
            holder.binding.drag.isVisible = edit

            holder.binding.delete.setOnClickListener {
                data.removeAt(holder.bindingAdapterPosition)
                notifyItemRemoved(holder.bindingAdapterPosition)
            }

            holder.binding.drag.setOnTouchListener { _, event ->
                if (event.action == MotionEvent.ACTION_DOWN) {
                    touchHelperCallBack.setDragged(true)
                } else {
                    touchHelperCallBack.setDragged(false)
                }
                return@setOnTouchListener true
            }

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
            return if (data.size > 10) 10 else data.size
        }
    }

    inner class TouchHelperCallBack : ItemTouchHelper.Callback() {

        private var drag = false

        fun setDragged(canDrag: Boolean) {
            drag = canDrag
        }

        override fun getMovementFlags(recyclerView: RecyclerView, viewHolder: RecyclerView.ViewHolder): Int {
            val dragFlags = if (drag) ItemTouchHelper.UP or ItemTouchHelper.DOWN else 0
            return makeMovementFlags(dragFlags, 0)
        }

        override fun onMove(recyclerView: RecyclerView, holder: RecyclerView.ViewHolder, target: RecyclerView.ViewHolder): Boolean {
            val from = holder.bindingAdapterPosition
            val to = target.bindingAdapterPosition
            var move = false
            try {
                val adapter = recyclerView.adapter as ContentAdapter
                if (adapter.data.size > 0) {
                    if (from < to) {
                        for (i in from until to) {
                            Collections.swap(adapter.data, i, i + 1)
                        }
                    } else {
                        for (i in from downTo to + 1) {
                            Collections.swap(adapter.data, i, i - 1)
                        }
                    }
                    adapter.notifyItemMoved(from, to)
                    move = true
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return move
        }

        override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {

        }
    }
}
