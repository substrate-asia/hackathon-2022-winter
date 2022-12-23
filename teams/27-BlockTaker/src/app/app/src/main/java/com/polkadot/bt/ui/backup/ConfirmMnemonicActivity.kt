package com.polkadot.bt.ui.backup

import android.content.Intent
import android.view.Gravity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import com.polkadot.bt.R
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.databinding.ActivityConfirmMnemonicBinding
import com.polkadot.bt.ext.AppManager
import com.polkadot.bt.ext.Constants
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ext.toast
import com.polkadot.bt.observer.ObserverManager
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.backup.adapter.ConfirmBackupAdapter
import com.polkadot.bt.ui.backup.adapter.ConfirmEditBackupAdapter
import com.polkadot.bt.ui.backup.adapter.OnClearClick
import com.polkadot.bt.ui.backup.adapter.OnItemClick
import com.polkadot.bt.ui.main.MainActivity
import kotlinx.coroutines.launch
import splitties.activities.start
import java.util.ArrayList

class ConfirmMnemonicActivity : BaseVBActivity<ActivityConfirmMnemonicBinding>() {
    private var editAdapter: ConfirmEditBackupAdapter? = null
    private var adapter: ConfirmBackupAdapter? = null
    private var data: ArrayList<String> = arrayListOf()
    private var valueId = 1L
    private var value: LocalValueEntityNew? = null
    private val originMnemonic: ArrayList<String> = arrayListOf()


    override fun initBinding() = ActivityConfirmMnemonicBinding.inflate(layoutInflater)

    override fun init() {
        binding.baseTitle.tvTitle.text = getString(R.string.confirm_mnemonic)
        var count = 0
        binding.recyclerViewEdit.layoutManager = GridLayoutManager(this, 3)
        editAdapter = ConfirmEditBackupAdapter(this, object : OnClearClick{
            override fun click() {
                count--
                adapter?.notifyItem()
            }
        })
        binding.recyclerViewEdit.adapter = editAdapter

        binding.recyclerView.layoutManager = GridLayoutManager(this, 3)
        adapter = ConfirmBackupAdapter(this, object : OnItemClick{
            override fun click(mnemonic: String) {
                editAdapter?.addData(hashMapOf(mnemonic to (mnemonic == originMnemonic[count])))
                if (mnemonic != originMnemonic[count]) {
                    toast(R.string.mnemonic_wrong, Gravity.CENTER)
                    adapter?.canClick = false
                }
                count++
                binding.tvComplete.isEnabled = count == data.size
            }
        })
        binding.recyclerView.adapter = adapter

        initData()
        initListeners()
    }

    private fun initData() {
        valueId = MySharedPreferences.get(Constants.CURRENT_VALUE, 1L)
        lifecycleScope.launch {
            value = ValueDatabaseNew.get(this@ConfirmMnemonicActivity).getValue(valueId)
            data = value?.mnemonic?.split(" ")?.toList() as ArrayList<String>
            originMnemonic.addAll(data)
            adapter?.setData(data.shuffled())
        }
    }

    private fun initListeners() {
        binding.baseTitle.ivBack.setOnClickListener { finish() }
        binding.tvComplete.setOnClickListener {
            lifecycleScope.launch {
                toast(getString(R.string.backup_complete),Gravity.CENTER)
                ValueDatabaseNew.get(this@ConfirmMnemonicActivity).insertValue(value!!.apply { isBackup = true })
                ObserverManager.instance.notifyObserver("")
                val isFromMetaSpace = intent.getBooleanExtra("isFromMetaSpace", false)
                if (isFromMetaSpace) {
                    //跳转myvertu
                    val intent = Intent()
                    intent.setClassName("com.vertu.life2","com.vertu.myvertu.activity.WelcomeActivity")
                    intent.putExtra("isFromMetaSpace", true)
                    startActivity(intent)
                    AppManager.getInstance().exit0()
                } else
                    start<MainActivity>()
            }
        }
    }
}