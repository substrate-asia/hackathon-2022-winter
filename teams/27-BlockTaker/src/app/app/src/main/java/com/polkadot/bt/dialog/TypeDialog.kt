package com.polkadot.bt.dialog

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.polkadot.bt.R
import com.polkadot.bt.bean.CoinBean
import com.polkadot.bt.databinding.TypeDialogItemBinding
import com.polkadot.bt.ext.loadImage

/**
 * @author Heaven
 * @date 2022/8/8 13:51
 */
class TypeDialog(context: Context,coinList: List<CoinBean>, checkedIndex: Int = 0, val perform: (String, Int) -> Unit) : BottomSheetDialog(context, R.style.MBottomSheetDialog) {
    private var list= arrayListOf<CoinBean>()

    init {
        val view = View.inflate(context, R.layout.type_dialog, null)
        val types: RecyclerView = view.findViewById(R.id.types)
        types.layoutManager = LinearLayoutManager(context)
        val adapter = TypesAdapter()
        types.adapter = adapter
        adapter.checkIndex = checkedIndex
        list= coinList as ArrayList<CoinBean>
        setContentView(view)
        setCancelable(true)
        setCanceledOnTouchOutside(true)

        behavior.isDraggable = false
    }

    inner class TypesAdapter : RecyclerView.Adapter<TypesAdapter.ViewHolder>() {

        var checkIndex = 0

        inner class ViewHolder(val binding: TypeDialogItemBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val bind = TypeDialogItemBinding.inflate(LayoutInflater.from(context), parent, false)
            return ViewHolder(bind)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            holder.binding.item.setText(list[position].name)
            loadImage(context,list[position].icon,holder.binding.icon)

            holder.binding.item.setChecked(checkIndex == position)

            holder.binding.item.setClickListener {
                val oldIndex = checkIndex
                checkIndex = holder.bindingAdapterPosition
                notifyItemChanged(oldIndex)
                notifyItemChanged(checkIndex)
                dismiss()
                perform.invoke(holder.binding.item.string(), checkIndex)
            }
        }

        override fun getItemCount(): Int {
            return list.size
        }
    }
}