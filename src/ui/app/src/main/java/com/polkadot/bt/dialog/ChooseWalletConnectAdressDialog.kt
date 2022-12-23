package com.polkadot.bt.dialog

import android.content.Context
import android.text.TextUtils
import android.view.LayoutInflater
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.R
import com.polkadot.bt.databinding.DialogChooseWalletConnectAddressBinding
import com.polkadot.bt.databinding.ItemChooseWalletConnectAddressBinding
import com.polkadot.bt.ext.Constants
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

/**
 * @author Heaven
 * @date 2022/8/8 13:51
 */
class ChooseWalletConnectAddressDialog(context: Context, clickCallBack: (linkEntityNew: LinkEntityNew, chainId: Int) -> Boolean) :
    BottomSheetDialog(context, R.style.MBottomSheetDialog) {


    enum class Chain(val link: String, val chainName: String, val chainId: Int) {
        Ethereum("ETH", "Ethereum", BuildConfig.ETH_CHAIN_ID),
        BNB("BNB", "BNB Chain", BuildConfig.BNB_CHAIN_ID),
        Avalanche("AVAX", "Avalanche C-Chain", BuildConfig.AVAX_CHAIN_ID),
    }

    init {

        val binding = DialogChooseWalletConnectAddressBinding.inflate(LayoutInflater.from(context))
        binding.toolbar.setMoreListener {
            dismiss()
        }

        MainScope().launch {
            val currentId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
            val localValue = ValueDatabaseNew.get(context).getValue(currentId)
            val name2ChainIdMap = mutableMapOf<String, Chain>()
            name2ChainIdMap.put("ETH", Chain.Ethereum)
            name2ChainIdMap.put("BNB", Chain.BNB)
            name2ChainIdMap.put("AVAX", Chain.Avalanche)
            localValue!!.linkList.forEach { linkEntity ->
                if (name2ChainIdMap.containsKey(linkEntity.link) && TextUtils.isEmpty(linkEntity.channel)) {
                    //todo test
                    //linkEntity.privateKey = "d19e8d09c0b544aa2f29cce559765f7e2bc8a2ce7c6f74ee1290b6b78fdf2b79".toByteArray()
                    val bindingChild = ItemChooseWalletConnectAddressBinding.inflate(LayoutInflater.from(context))
                    bindingChild.tvName.text = name2ChainIdMap.get(linkEntity.link)!!.chainName
                    bindingChild.tvAddress.text = linkEntity.address
                    bindingChild.root.setOnClickListener {
                        if (clickCallBack.invoke(linkEntity, name2ChainIdMap.get(linkEntity.link)!!.chainId))
                            dismiss()
                    }
                    binding.llContainer.addView(bindingChild.root)
                }
            }
        }

        setContentView(binding.root)
        setCancelable(true)
        setCanceledOnTouchOutside(true)
    }
}