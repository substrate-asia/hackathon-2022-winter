package com.polkadot.bt.ui.dapp

import android.content.Intent
import android.text.TextUtils
import android.view.View
import com.bumptech.glide.Glide
import com.bumptech.glide.request.RequestOptions
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityWalletConnectSessionBinding
import com.polkadot.bt.dialog.ChooseWalletConnectAddressDialog
import com.polkadot.bt.dialog.TipsDialog
import com.polkadot.bt.ext.Constants
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ext.toast
import com.polkadot.bt.module.wallet_connect.WCController
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.ui.BaseActivity
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

class WalletConnectSessionActivity : BaseActivity<ActivityWalletConnectSessionBinding>() {
    val wcListener: WCController.WCListener = object : WCController.WCListener() {
        override fun onDisconnect(code: Int, reason: String) {
            setupView()
        }

        override fun onFailure(throwable: Throwable) {
            setupView()
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setupView()
    }

    override fun initBinding(): ActivityWalletConnectSessionBinding = ActivityWalletConnectSessionBinding.inflate(layoutInflater)

    override fun init() {
        if (!WCController.wcClient.isConnected) {
            finish()
            return
        }
        setupView()
        WCController.listenerList.add(wcListener)
        Glide.with(this)
            .load(WCController.lastPeer!!.icons[0])
            .apply(RequestOptions().circleCrop().placeholder(R.drawable.shape_d8d8d8_circle_bg))
            .into(binding.ivIcon)
        binding.tvName.text = "${WCController.lastPeer!!.name}"
        binding.tvUrl.text = WCController.lastPeer!!.url
        binding.btnGrant.setOnClickListener {
            MainScope().launch {
                var isEmpty = true
                val currentId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
                val localValue = ValueDatabaseNew.get(this@WalletConnectSessionActivity).getValue(currentId)
                val name2ChainIdMap = mutableMapOf<String, ChooseWalletConnectAddressDialog.Chain>()
                name2ChainIdMap.put("ETH", ChooseWalletConnectAddressDialog.Chain.Ethereum)
                name2ChainIdMap.put("BNB", ChooseWalletConnectAddressDialog.Chain.BNB)
                name2ChainIdMap.put("AVAX", ChooseWalletConnectAddressDialog.Chain.Avalanche)
                localValue!!.linkList.forEach { linkEntity ->
                    if (name2ChainIdMap.containsKey(linkEntity.link) && TextUtils.isEmpty(linkEntity.channel)) {
                        isEmpty = false
                    }
                }
                if (isEmpty) {
                    TipsDialog(this@WalletConnectSessionActivity, getString(R.string.link_not_support)).show()
                } else
                    ChooseWalletConnectAddressDialog(this@WalletConnectSessionActivity) { linkEntity, chainId ->
                        WCController.approveSession(listOf(linkEntity.address), chainId, linkEntity)
                        toast(getString(R.string.already_connect_tips))
                        setupView()
                        return@ChooseWalletConnectAddressDialog true
                    }.show()
            }

        }
        binding.btnReject.setOnClickListener {
            WCController.wcClient.rejectSession()
            WCController.wcClient.disconnect()
            finish()
        }
        binding.btnDisconnect.setOnClickListener {
            if (WCController.wcClient.isConnected) {
                WCController.wcClient.rejectSession()
                WCController.wcClient.disconnect()
            }
            finish()
        }
    }

    private fun setupView() {
        if (!WCController.wcClient.isConnected) {
            //内容
            binding.llAuthorityList.visibility = View.GONE
            binding.llStatus.visibility = View.VISIBLE
            binding.tvStatus.text = resources.getString(R.string.disconnected)
            binding.tvStatus.setTextColor(resources.getColor(R.color.color_tips))
            binding.tvAddress.text = "-"
            //按钮
            binding.btnGrant.visibility = View.GONE
            binding.btnReject.visibility = View.GONE

            binding.btnDisconnect.text = resources.getString(R.string.back)
            binding.btnDisconnect.visibility = View.VISIBLE
        } else if (!WCController.isSessionApproved) {
            //内容
            binding.llAuthorityList.visibility = View.VISIBLE
            binding.llStatus.visibility = View.GONE
            //按钮
            binding.btnGrant.visibility = View.VISIBLE
            binding.btnReject.visibility = View.VISIBLE
            binding.btnDisconnect.visibility = View.GONE
        } else {
            //内容
            binding.llAuthorityList.visibility = View.GONE
            binding.llStatus.visibility = View.VISIBLE
            binding.tvStatus.text = resources.getString(R.string.connected)
            binding.tvStatus.setTextColor(resources.getColor(R.color.indicator))
            binding.tvAddress.text = "${WCController.linkEntityNew?.address}"
            //按钮
            binding.btnGrant.visibility = View.GONE
            binding.btnReject.visibility = View.GONE

            binding.btnDisconnect.text = resources.getString(R.string.disconnect)
            binding.btnDisconnect.visibility = View.VISIBLE
        }
    }

    override fun onDestroy() {
        WCController.listenerList.remove(wcListener)
        super.onDestroy()
    }
}