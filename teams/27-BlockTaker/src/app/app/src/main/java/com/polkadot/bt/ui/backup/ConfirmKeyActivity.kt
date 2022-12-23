package com.polkadot.bt.ui.backup

import android.annotation.SuppressLint
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityConfirmKeyBinding
import com.polkadot.bt.dialog.BackupTipsDialog
import com.polkadot.bt.ext.copyToClipboard
import com.polkadot.bt.ext.string
import com.polkadot.bt.ext.toast
import com.polkadot.bt.ui.BaseVBActivity

class ConfirmKeyActivity : BaseVBActivity<ActivityConfirmKeyBinding>() {
    override fun initBinding() = ActivityConfirmKeyBinding.inflate(layoutInflater)
    var type:String=""
    @SuppressLint("SetTextI18n")
    override fun init() {
        type= intent.getStringExtra("type")!!
        binding.baseTitle.tvTitle.text = "${type}${getString(R.string.private_key)}"
        BackupTipsDialog(this, getString(R.string.backup_key_tips)).show()
        initData()
        initListeners()
    }

    private fun initData() {
        val key =intent.getStringExtra("key")
        binding.tvKey.text=key

       /* lifecycleScope.launch {
            val id=intent.getLongExtra("id",1L)
            val value=ValueDatabase.get(this@ConfirmKeyActivity).getValue(id)
            value?.linkList?.forEach {
                if (it.link==type){
                    binding.tvKey.text=it.privateKey
                }
            }

        }*/

        //获取私钥
//        binding.tvKey.text = "0449313cc5ca2dce29116a325a5dddef3bbc53424150e51cd7acea"
    }

    private fun initListeners() {
        binding.baseTitle.ivBack.setOnClickListener { finish() }
        binding.tvCopy.setOnClickListener {
            copyToClipboard(this,binding.tvKey.string())
            toast(getString(R.string.copy_success))
        }
    }
}