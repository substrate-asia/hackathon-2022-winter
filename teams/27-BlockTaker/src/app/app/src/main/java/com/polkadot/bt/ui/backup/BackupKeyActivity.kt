package com.polkadot.bt.ui.backup

import android.content.Intent
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityBackupKeyBinding
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.backup.adapter.BackupKeyAdapter
import com.polkadot.bt.ui.backup.adapter.OnItemClickListener
import kotlinx.coroutines.launch

class BackupKeyActivity : BaseVBActivity<ActivityBackupKeyBinding>() {
    private var adapter: BackupKeyAdapter? = null
    override fun initBinding() = ActivityBackupKeyBinding.inflate(layoutInflater)

    override fun init() {
        binding.baseTitle.tvTitle.text = getString(R.string.backup_key)

        val layoutManager = LinearLayoutManager(this)
        binding.recyclerView.layoutManager = layoutManager
        adapter = BackupKeyAdapter(this, object : OnItemClickListener {
            override fun click(type: String,key:String) {
                startActivity(Intent(this@BackupKeyActivity, ConfirmKeyActivity::class.java)
                    .putExtra("type", type)
                    .putExtra("key",key))

            }
        })
        binding.recyclerView.adapter = adapter

        initData()
        initListeners()
    }

    private fun initData() {
        lifecycleScope.launch {
            val id=intent.getLongExtra("id",1L)
            val value= ValueDatabaseNew.get(this@BackupKeyActivity).getValue(id)
            val list= arrayListOf<LinkEntityNew>()
            value!!.linkList.forEach {
                if (it.privateKey.isNotEmpty()&&it.channel.isEmpty())
                    list.add(it)
            }
            adapter?.setData(list)
        }

//        adapter?.setData(arrayListOf("BTC","ETH"/*,"TAF"*/))
    }

    private fun initListeners() {
        binding.baseTitle.ivBack.setOnClickListener { finish() }
    }
}