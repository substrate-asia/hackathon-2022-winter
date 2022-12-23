package com.polkadot.bt.ui.home.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.getMainLinkIcon
import com.polkadot.bt.ext.*
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.home.CurrencyIntroductionActivity
import com.polkadot.bt.ui.view.CircleImageView

class AssetsAdapter(private val context: Context) :
    RecyclerView.Adapter<AssetsAdapter.MyViewHolder>() {
    private var mList: List<LinkEntityNew> = arrayListOf()
    private var isEye: Boolean = true
    var rate = 1.0
    var symbol = ""
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        isEye = MySharedPreferences.get(Constants.VALUE_IS_EYE, true)
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_assets, parent, false)
        )
    }

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: List<LinkEntityNew>) {
        mList = list
        notifyDataSetChanged()
    }

    fun getData(): List<LinkEntityNew> {
        return mList
    }

    fun setEye() {
        isEye = true
        notifyDataSetChanged()
    }

    fun setHide() {
        isEye = false
        notifyDataSetChanged()
    }

    fun changeNum(position: Int) {
        notifyItemChanged(position, R.id.tvNum)
    }

    fun changeMoney(position: Int, symbol: String, rate: Double) {
        notifyItemChanged(position, R.id.tvMoney)
        this.rate = rate
        this.symbol = symbol
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        holder.tvName.text = mList[position].link
        if (mList[position].channel.isNotEmpty()) {
            holder.tvFlag.visible()
            holder.tvFlag.text = mList[position].channel
            loadImage(context, mList[position].icon, holder.icon)
            val small = when (mList[position].channel) {
                "OMNI" -> R.drawable.mainlink_icon_bitcoin
                "ERC20" -> R.drawable.mainlink_icon_ethereum
                "BEP20" -> R.drawable.mainlink_icon_binance
                "HRC20" -> R.drawable.mainlink_icon_ht
                "MATIC" -> R.drawable.mainlink_icon_matictoken
                "AVAX C-Chain" -> R.drawable.mainlink_icon_avalanche
                else -> 0
            }
            holder.iconSmall.visible()
            loadImage(context, small, holder.iconSmall)
        } else {
            holder.tvFlag.gone()
//            loadImage(context,mList[position].icon.toInt(),holder.icon)
            loadImage(context, getMainLinkIcon(mList[position].link), holder.icon)
            holder.iconSmall.gone()
        }

        if (isEye) {
            val link = mList[position]
            if (link.link == "DOT") {
                val numberArray = link.linkNumber.split(":")
                val availableNum = if (numberArray[0].isNotEmpty()) getNoMoreThanEightDigits(numberArray[0].toDouble()) else "0"
                val availableMoney = "$symbol${getNoMoreThanEightDigits(link.linkPrice.toDouble() * numberArray[0].toDouble() * rate)}"
                val totleNum = if (numberArray.size >= 2 && numberArray[1].isNotEmpty()) getNoMoreThanEightDigits(numberArray[1].toDouble()) else "0"
                val totleMoney = if (numberArray.size >= 2 && numberArray[1].isNotEmpty())
                    "$symbol${getNoMoreThanEightDigits(link.linkPrice.toDouble() * numberArray[1].toDouble() * rate)}"
                else
                    "0"
//                holder.tvNum.text = "$availableNum/$totleNum"
                holder.tvNum.text = "$availableNum"
//                holder.tvMoney.text = "$availableMoney/$totleMoney"
                holder.tvMoney.text = "$availableMoney"
            } else {
                holder.tvNum.text = if (link.linkNumber.isNotEmpty()) getNoMoreThanEightDigits(mList[position].linkNumber.toDouble()) else "0"
                holder.tvMoney.text = "$symbol${getNoMoreThanEightDigits(link.linkPrice.toDouble() * link.linkNumber.toDouble() * rate)}"
            }
        } else {
            holder.tvNum.text = "**********"
            holder.tvMoney.text = "******"
        }
        holder.itemView.setOnClickListener {
            val entity = mList[position]
            if (entity.linkPrice.isEmpty()) return@setOnClickListener  //单价未获取到不执行点击
            if (entity.link == "DOT" && entity.linkNumber == "0") return@setOnClickListener
            context.startActivity(
                Intent(context, CurrencyIntroductionActivity::class.java)
                    .putExtra("link", entity)
            )
        }
    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvName: TextView = itemView.findViewById(R.id.tvName)
        val tvFlag: TextView = itemView.findViewById(R.id.tvFlag)
        val tvNum: TextView = itemView.findViewById(R.id.tvNum)
        val tvMoney: TextView = itemView.findViewById(R.id.tvMoney)
        val icon: CircleImageView = itemView.findViewById(R.id.assets_img)
        val iconSmall: CircleImageView = itemView.findViewById(R.id.assets_img_link)
    }
}

