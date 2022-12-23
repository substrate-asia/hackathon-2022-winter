package com.polkadot.bt.ui.home.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.CurrencyBean
import com.polkadot.bt.databinding.AddCoinItemBinding
import com.polkadot.bt.ext.*
import com.polkadot.bt.room.entities.LinkEntityNew
import splitties.views.imageResource

class ContentAdapter(private val context: Context) : RecyclerView.Adapter<ContentAdapter.ViewHolder>() {
     private var mList: List<CurrencyBean> = arrayListOf()
     private var links = arrayListOf<LinkEntityNew>()
    private var channelList= arrayListOf<String>()
    lateinit var onClickAdd:(v: View, pos:Int, data: CurrencyBean) ->Unit
    lateinit var onClickSub:(v: View, pos:Int, data: CurrencyBean) ->Unit

    inner class ViewHolder(val binding: AddCoinItemBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = AddCoinItemBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

     @SuppressLint("NotifyDataSetChanged")
     fun setData(list: List<CurrencyBean>, linkList: List<LinkEntityNew>){
         mList = list
         links= linkList as ArrayList<LinkEntityNew>
    /*     links.forEach {
             when(it.link){
                 "BTC"-> channelList.add("OMNI")
                 "ETH"-> channelList.add("ERC20")
                 "BNB"-> channelList.add("BEP20")
                 "HT"-> channelList.add("HRC20")
                 "AVAX"-> channelList.add("AVAX C-Chain")
                 "MATIC"-> channelList.add("MATIC")
             }
         }*/
         notifyDataSetChanged()
     }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        isSemiBold(holder.binding.coinName, holder.binding.type)

        holder.binding.type.text = mList[position].channel
        holder.binding.coinName.text=mList[position].symbol
        if (mList[position].address.isNotEmpty())
        holder.binding.address.text=
        "${mList[position].address.substring(0, 9)}...${
            mList[position].address.substring(mList[position].address.length - 9)
        }"

        loadImage(context,mList[position].logo_url,holder.binding.logo)
        holder.binding.add.isSelected=false
        holder.binding.add.imageResource =  R.drawable.add
        links.forEach {
            if (it.coinAddress==mList[position].address&&it.channel==mList[position].channel){
                holder.binding.add.isSelected=true
                holder.binding.add.imageResource = R.drawable.added
            }
        }
//        holder.binding.root.visibleOrGone(holder.binding.coinName.string().contains(key.uppercase()))

        holder.binding.add.setOnClickListener { it ->
           /* if (!channelList.contains(mList[position].channel)){
                toast(context.getString(R.string.no_main_link))
                return@setOnClickListener
            }*/

            holder.binding.add.isSelected = !holder.binding.add.isSelected
            if (holder.binding.add.isSelected) {
                links.add(LinkEntityNew(coinAddress = mList[position].address, channel = mList[position].channel))
//                nameList.add(mList[position].symbol)
                holder.binding.add.imageResource = R.drawable.added
                onClickAdd.invoke(it, position, mList[position])
            }else {
                links.removeIf {
                    it.coinAddress==mList[position].address&&it.channel==mList[position].channel
                }
//                nameList.remove(mList[position].symbol)
                holder.binding.add.imageResource= R.drawable.add
                onClickSub.invoke(it, position, mList[position])
            }
        }
    }

    override fun getItemCount(): Int {
        return mList.size
    }
}