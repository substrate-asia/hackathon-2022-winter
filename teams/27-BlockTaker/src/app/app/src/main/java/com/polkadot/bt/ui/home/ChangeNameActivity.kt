package com.polkadot.bt.ui.home

import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityChangeValueNameBinding
import com.polkadot.bt.ext.clickNoRepeat
import com.polkadot.bt.ext.string
import com.polkadot.bt.ext.toast
import com.polkadot.bt.observer.ObserverManager
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.ValueNameEntity
import com.polkadot.bt.ui.BaseVBActivity
import kotlinx.coroutines.launch

class ChangeNameActivity :BaseVBActivity<ActivityChangeValueNameBinding>(){
    override fun initBinding()=ActivityChangeValueNameBinding.inflate(layoutInflater)


    override fun init() {
        binding.tvCreate.clickNoRepeat {
           /* if (binding.valueName.string().isEmpty()){
                toast(getString(R.string.name_null))
                return@clickNoRepeat
            }*/
            lifecycleScope.launch {
                ValueDatabaseNew.get(this@ChangeNameActivity).
                updateValueName(
                    ValueNameEntity(id = intent.getLongExtra("id",1L),
                        binding.valueName.string()
                    )
                )
                ObserverManager.instance.notifyObserver("")
                toast(getString(R.string.change_name))
                finish()
            }
        }

        binding.valueName.addTextChangedListener {
            binding.tvCreate.isEnabled= it.toString().isNotEmpty()
        }
    }
}