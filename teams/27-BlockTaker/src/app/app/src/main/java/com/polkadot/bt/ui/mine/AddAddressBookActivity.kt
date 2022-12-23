package com.polkadot.bt.ui.mine

import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.R
import com.polkadot.bt.bean.CoinBean
import com.polkadot.bt.bean.getMainLinks
import com.polkadot.bt.data.BTCUtils
import com.polkadot.bt.databinding.AddAddressBookActivityBinding
import com.polkadot.bt.dialog.NormalDialog
import com.polkadot.bt.dialog.TypeDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.room.AddressDatabase
import com.polkadot.bt.room.entities.AddressEntity
import com.polkadot.bt.ui.BaseActivity
import kotlinx.coroutines.launch

class AddAddressBookActivity : BaseActivity<AddAddressBookActivityBinding>() {

    private var checkedIndex = 0

    private var isEdit: Boolean = false
    private var addressEntity: AddressEntity? = null
    override fun initBinding() = AddAddressBookActivityBinding.inflate(layoutInflater)

    override fun init() {
        val coinList = getMainLinks()

        isEdit = intent?.getBooleanExtra("isEdit", false)!!
        if (isEdit) {
            binding.toolbar.setTitleText(getString(R.string.address))
            addressEntity = intent?.getSerializableExtra("addressEntity") as AddressEntity
            binding.type.setText(addressEntity?.linkType!!)
            for (i in 0 until coinList.size) {
                if (coinList[i].name == addressEntity?.linkType!!)
                    checkedIndex = i
            }
            binding.name.setText(addressEntity?.addressName)
            binding.address.setText(addressEntity?.addressContent)
            binding.desc.setText(addressEntity?.describes)
        } else {
            binding.toolbar.setRightText("")
            binding.delete.text = getString(R.string.save)
            binding.type.setText("BTC")
        }
        binding.toolbar.setRightListener {
            saveAddress(coinList)
        }
        binding.delete.setOnClickListener {
            if (isEdit) {
                NormalDialog.build(this) {
                    titleText = getString(R.string.delete_address)
                    contentText = getString(R.string.delete_address_dialog)
                    confirmText = getString(R.string.delete_confirm)
                    confirmClick = {
                        lifecycleScope.launch {
                            AddressDatabase.get(this@AddAddressBookActivity).deleteValue(addressEntity?.id!!)
                            finish()
                        }
                    }
                }.show()
            } else {
                saveAddress(coinList)
            }

        }

        binding.type.isSemiBold()
        binding.name.isSemiBold()
        binding.address.isSemiBold()
        binding.desc.isSemiBold()

        binding.type.setOnClickListener {
            TypeDialog(this, coinList, checkedIndex) { text, position ->
//                toast("choose $text")
                checkedIndex = position
                binding.type.setText(text)
            }.show()
        }
    }

    private fun saveAddress(coinList: ArrayList<CoinBean>) {
        lifecycleScope.launch {
            if (binding.name.string().isEmpty()) {
                toast(getString(R.string.name_null))
                return@launch
            }
            if (binding.address.string().isEmpty()) {
                toast(getString(R.string.address_null))
                return@launch
            }
            //地址校验
            val isAddress = if (coinList[checkedIndex].name == "BTC") {
                BTCUtils.isBtcAddress(binding.address.string())
            } else if (coinList[checkedIndex].name == "DOT") {
                //todo DOT地址有效性验证待实现
                true
            } else {
                isValidAddress(binding.address.string())
            }
            if (!isAddress) {
                toast(R.string.address_error)
                return@launch
            }
            if (coinList[checkedIndex].name == "BTC") {
                if (binding.address.string().startsWith("3") || binding.address.string().startsWith("bc")) {
                    toast(R.string.address_not_support)
                    return@launch
                }
            }


            if (isEdit) {//编辑地址
                AddressDatabase.get(this@AddAddressBookActivity).updateAddress(
                    AddressEntity(
                        id = addressEntity?.id!!,
                        linkType = coinList[checkedIndex].name,
                        linkIcon = coinList[checkedIndex].icon.toString(),
                        addressName = binding.name.string(),
                        addressContent = binding.address.string(),
                        describes = binding.desc.string()
                    )
                )

            } else {//新增地址
                AddressDatabase.get(this@AddAddressBookActivity).insertAddress(
                    AddressEntity(
                        id = 0,
                        linkType = coinList[checkedIndex].name,
                        linkIcon = coinList[checkedIndex].icon.toString(),
                        addressName = binding.name.string(),
                        addressContent = binding.address.string(),
                        describes = binding.desc.string()
                    )
                )
            }

            finish()
        }
    }
}
