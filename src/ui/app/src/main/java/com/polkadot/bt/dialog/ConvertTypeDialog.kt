package com.polkadot.bt.dialog

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import androidx.core.widget.addTextChangedListener
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.polkadot.bt.R
import com.polkadot.bt.bean.Token
import com.polkadot.bt.bean.getSwapLinks
import com.polkadot.bt.databinding.TypeDialogItemBinding
import com.polkadot.bt.dialog.adapter.DialogLinkAdapter
import com.polkadot.bt.ext.loadImage
import com.polkadot.bt.ext.screenHeight
import com.polkadot.bt.ext.screenWidth


class ConvertTypeDialog(context: Context, coinList: List<Token>, checkedIndex: Token, isShowLink: Boolean, currentLink: String, val perform: (String, Token) -> Unit,val link:(String) ->Unit) : BottomSheetDialog(context, R.style.MBottomSheetDialog) {
    private var list= arrayListOf<Token>()
    private var sears= arrayListOf<Token>()
    private var adapter=TypeAdapter()
    init {
        val view = View.inflate(context, R.layout.dialog_convert_select, null)
        view.findViewById<TextView>(R.id.cancel).setOnClickListener { dismiss() }

        val links: RecyclerView = view.findViewById(R.id.links)
        val types: RecyclerView = view.findViewById(R.id.types)
        links.layoutManager=GridLayoutManager(context,4)
        types.layoutManager = LinearLayoutManager(context)
        val linkAdapter=DialogLinkAdapter(context, getSwapLinks(), currentLink)
        if (isShowLink)
            links.adapter=linkAdapter
        linkAdapter.onItemClick={
            link.invoke(it)
        }

        types.adapter = adapter
        adapter.checkIndex = checkedIndex
        list= coinList as ArrayList<Token>
        sears.addAll(coinList)
        view.findViewById<EditText>(R.id.search).addTextChangedListener { editable ->
            sears.clear()
            if (editable.toString().isNotEmpty()){
                list.forEach {
                    if( it.name.lowercase().contains(editable.toString().lowercase())||it.symbol.lowercase().contains(editable.toString().lowercase()))
                        sears.add(it)
                }
            }else{
                sears.addAll(list)
            }
            adapter.notifyDataSetChanged()
        }

        setContentView(view)
        setCancelable(false)
        setCanceledOnTouchOutside(false)
        behavior.isDraggable = false

        val params = window?.attributes
        params?.width = screenWidth
        params?.height= (screenHeight*0.9).toInt()
        window?.attributes = params
    }

    fun setDate(list:List<Token>){
        this.list= list as ArrayList<Token>
        sears.clear()
        sears.addAll(list)
        adapter.checkIndex = list[0]
        adapter.notifyDataSetChanged()
    }

    inner class TypeAdapter : RecyclerView.Adapter<TypeAdapter.ViewHolder>() {

        lateinit var checkIndex :Token

        inner class ViewHolder(val binding: TypeDialogItemBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val bind = TypeDialogItemBinding.inflate(LayoutInflater.from(context), parent, false)
            return ViewHolder(bind)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            holder.binding.item.hideBottomLine()
            holder.binding.item.setText(sears[position].symbol)
            loadImage(context,sears[position].logoURI,holder.binding.icon)

            holder.binding.item.setChecked(checkIndex.address == sears[position].address)

            holder.binding.item.setClickListener {
//                val oldIndex = checkIndex
//                checkIndex = holder.bindingAdapterPosition
//                notifyItemChanged(oldIndex)
//                notifyItemChanged(checkIndex)
                dismiss()
                perform.invoke(holder.binding.item.string(), sears[position])
            }
        }

        override fun getItemCount(): Int {
            return sears.size
        }
    }

}