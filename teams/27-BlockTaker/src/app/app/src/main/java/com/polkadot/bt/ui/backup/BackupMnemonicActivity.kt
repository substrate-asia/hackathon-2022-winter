package com.polkadot.bt.ui.backup

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityBackupMnemonicBinding
import com.polkadot.bt.dialog.BackupTipsDialog
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.backup.adapter.BackupAdapter
import com.polkadot.bt.ui.main.MainActivity
import kotlinx.coroutines.launch
import splitties.activities.start
import java.util.ArrayList


class BackupMnemonicActivity : BaseVBActivity<ActivityBackupMnemonicBinding>() {
    private var adapter: BackupAdapter? = null
    private var valueId = 1L
    override fun initBinding() = ActivityBackupMnemonicBinding.inflate(layoutInflater)

    override fun onCreate(savedInstanceState: Bundle?) {
        //限制截屏录频
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        super.onCreate(savedInstanceState)
    }

    override fun init() {
        binding.baseTitle.tvTitle.text = getString(R.string.backup_mnemonic)
        val layoutManager = GridLayoutManager(this, 3)
        binding.recyclerView.layoutManager = layoutManager
        adapter = BackupAdapter(this)
        binding.recyclerView.adapter = adapter
        BackupTipsDialog(this, getString(R.string.backup_mnemonic_tips)).show()
        initData()
        initListeners()
    }

    private fun initData() {
//        valueId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
        valueId=intent.getLongExtra("id",1L)
        lifecycleScope.launch {
            val value = ValueDatabaseNew.get(this@BackupMnemonicActivity).getValue(valueId)
            val data = value?.mnemonic?.split(" ")?.toList() as ArrayList<String>
            adapter?.setData(data)
        }
    }

    private fun initListeners() {
        binding.baseTitle.ivBack.setOnClickListener {
            finish()
        }
        binding.tvComplete.setOnClickListener {
            if (intent?.getBooleanExtra("isBackup",false)!!){
                start<MainActivity>()
                finish()
                return@setOnClickListener
            }
            startActivity(Intent(this, ConfirmMnemonicActivity::class.java)
                .putExtra("valueId", valueId)
                .putExtra("isFromMetaSpace", intent.getBooleanExtra("isFromMetaSpace", false)))
        }
    }
}