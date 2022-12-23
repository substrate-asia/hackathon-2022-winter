package com.polkadot.bt.ui.home.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.ext.Constants
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ui.home.ManageValueActivity
import com.polkadot.bt.ui.view.CircleImageView

class ValueAdapter(private val context: Context) :
    RecyclerView.Adapter<ValueAdapter.MyViewHolder>() {
    private var mList: List<LocalValueEntityNew> = arrayListOf()
    private  var mPosition:Int?=null
    private var currentId:Long?=null
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
         //获取系统存储的当前钱包
        currentId=MySharedPreferences.get(Constants.CURRENT_VALUE,0)
        return MyViewHolder(
            LayoutInflater.from(context).inflate(R.layout.item_value, parent, false)
        )
    }

    @SuppressLint("NotifyDataSetChanged")
    fun setData(list: List<LocalValueEntityNew>){
        mList = list
        notifyDataSetChanged()
    }

    fun getData(): List<LocalValueEntityNew> {
        return mList
    }

    lateinit var onItemClick:(v:View,pos:Int,data:LocalValueEntityNew) ->Unit
    lateinit var onItemClickManage:(v:View,pos:Int,data:LocalValueEntityNew) ->Unit



    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(holder: MyViewHolder, @SuppressLint("RecyclerView") position: Int) {
        holder.tvName.text = mList[position].name
        if (mList[position].mnemonic.isEmpty()){
            holder.tvTitle.text=context.getString(R.string.single_link)
        }else{
            holder.tvTitle.text=context.getString(R.string.init_title)
        }
        holder.itemView.setOnClickListener {
            //获取系统存储的当前钱包
            currentId=MySharedPreferences.get(Constants.CURRENT_VALUE,1L)
            if (currentId!=mList[position].id){
                //保存当前点击切换钱包
                MySharedPreferences.put(Constants.CURRENT_VALUE,mList[position].id)
                currentId=mList[position].id

                onItemClick.invoke(it,position,mList[position])
                notifyDataSetChanged()
            }

        }
        holder.tvManage.setOnClickListener {
            context.startActivity(Intent(context,ManageValueActivity::class.java)
                .putExtra("password",mList[position].password)
                .putExtra("id",mList[position].id)
                .putExtra("name",mList[position].name)
                .putExtra("isBackup",mList[position].isBackup)
                .putExtra("mnemonic",mList[position].mnemonic)
            )
            onItemClickManage.invoke(it,position,mList[position])


        }

        if (mList[position].id==currentId){
            holder.llValue.background= context.getDrawable(R.drawable.corners6_primary)
            holder.circleIv.setColorFilter(R.color.white)
            holder.tvTitle.setTextColor(context.getColor(R.color.white))
            holder.tvManage.setTextColor(context.getColor(R.color.white))
            holder.tvName.setTextColor(context.getColor(R.color.white))
        }else{

            holder.llValue.background=context.getDrawable(R.drawable.corners5_primary_storck)
            holder.circleIv.setColorFilter(R.color.color_circle_color)
            holder.tvTitle.setTextColor(context.getColor(R.color.colorTitle))
            holder.tvManage.setTextColor(context.getColor(R.color.color_manage_color))
            holder.tvName.setTextColor(context.getColor(R.color.colorTitle))

        }

    }

    override fun getItemCount(): Int {
        return mList.size
    }

    inner class MyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val llValue:LinearLayout=itemView.findViewById(R.id.ll_item_value)
        val tvName: TextView = itemView.findViewById(R.id.vaue_name)
        val circleIv: CircleImageView = itemView.findViewById(R.id.circle_iv)
        val tvTitle:TextView=itemView.findViewById(R.id.tv_value_title)
        val tvManage:TextView=itemView.findViewById(R.id.tv_value_manage)
    }
}

