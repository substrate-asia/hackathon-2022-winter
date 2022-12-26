package com.polkadot.bt.ui.create

import android.content.Intent
import android.text.TextUtils
import android.text.method.HideReturnsTransformationMethod
import android.text.method.LinkMovementMethod
import android.text.method.PasswordTransformationMethod
import android.view.Gravity
import android.view.View
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.R
import com.polkadot.bt.bean.LocalValueEntityNew
import com.polkadot.bt.data.BTCUtils
import com.polkadot.bt.data.DOTUtils
import com.polkadot.bt.databinding.ActivityCreateWalletBinding
import com.polkadot.bt.ext.*
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.observer.ObserverManager
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseVBActivity
import com.polkadot.bt.ui.channel.ImportActivity.Companion.KEY
import com.polkadot.bt.ui.channel.ImportRepeatActivity
import com.polkadot.bt.ui.main.MainActivity
import kotlinx.coroutines.launch
import splitties.activities.start
import utils.GenerateWalletKeyUtil
import java.io.File

class CreateWalletActivity : BaseVBActivity<ActivityCreateWalletBinding>() {
    //    private val regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[\\s\\S]{8,16}\$".toRegex()
    private val regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,16}\$".toRegex()
    override fun initBinding() = ActivityCreateWalletBinding.inflate(layoutInflater)

    override fun init() {
        if (TextUtils.isEmpty(intent.getStringExtra("from"))) {
            binding.baseTitle.tvTitle.text = getString(R.string.init_create)
            binding.tvCreate.text = getString(R.string.create)
        } else {
            binding.baseTitle.tvTitle.text = getString(R.string.init_import)
            binding.tvCreate.text = getString(R.string.channel)
        }
        initListeners()
    }

    private fun initListeners() {
        binding.baseTitle.ivBack.setOnClickListener {
            finish()
        }
        binding.etName.addTextChangedListener {
            binding.etName.isSemiBold(it?.isNotEmpty()!!)
            binding.ivClear.visibility = if (TextUtils.isEmpty(it)) View.GONE else View.VISIBLE
            enableCreate()
        }
        binding.ivClear.setOnClickListener {
            binding.etName.setText("")
        }
        binding.etPwd.addTextChangedListener {
            binding.ivPwd.visibility = if (TextUtils.isEmpty(it)) View.GONE else View.VISIBLE
            if (binding.etRepwd.string().isNotEmpty())
                binding.tvRepwd.visibility = if (it.toString() != binding.etRepwd.string()) View.VISIBLE else View.GONE
            binding.tvPwd.setTextColor(getColor(if (it != null && it.matches(regex)) R.color.color9 else R.color.color_tips))
            enableCreate()
        }
        binding.etRepwd.addTextChangedListener {
            binding.ivRepwd.visibility = if (TextUtils.isEmpty(it)) View.GONE else View.VISIBLE
            binding.tvRepwd.visibility = if (it.toString() != binding.etPwd.string()) View.VISIBLE else View.GONE
            enableCreate()
        }
        binding.ivPwd.setOnClickListener {
            binding.etPwd.transformationMethod = if (!it.isSelected) HideReturnsTransformationMethod.getInstance()
            else PasswordTransformationMethod.getInstance()
            it.isSelected = !it.isSelected
        }
        binding.ivRepwd.setOnClickListener {
            binding.etRepwd.transformationMethod = if (!it.isSelected) HideReturnsTransformationMethod.getInstance()
            else PasswordTransformationMethod.getInstance()
            it.isSelected = !it.isSelected
        }
        binding.cbAgree.setOnCheckedChangeListener { _, _ ->
            enableCreate()
        }
        binding.tvAgree0.movementMethod = LinkMovementMethod.getInstance()
//        binding.tvAgree.setOnClickListener {
////            start<PrivacyActivity>()
//        }
        binding.tvCreate.setOnClickListener {
            val from = intent.getStringExtra("from") ?: ""
            val info = intent.getStringExtra("info") ?: ""
            val type = intent.getStringExtra("type") ?: ""
            val icon = intent.getIntExtra("icon", -1)
            val isFromMetaSpace = intent.getBooleanExtra("isFromMetaSpace", false)
            when (from) {
                KEY -> {
                    val formatInfo = info.replace(" ", "").trim()
                    lifecycleScope.doHttp({
                        if (ValueDatabaseNew.get(this@CreateWalletActivity).isValueExist(formatInfo, KEY, type)) {
                            start<ImportRepeatActivity>()
                        } else {
                            val file = File(filesDir, "value/")
                            if (!file.exists())
                                file.mkdirs()
                            //导入私钥逻辑进入主页
                            val params = BTCUtils.initParam()
                            val valueInfo = if (type == "DOT") {
                                DOTUtils.accountWithPrivKey(formatInfo)
                            } else {
                                GenerateWalletKeyUtil().importPrivateKey(
                                    params,
                                    file.absolutePath,
                                    formatInfo,
                                    type
                                )
                            }
                            if (valueInfo == null) {
                                toast(getString(R.string.private_key_error), gravity = Gravity.CENTER)
                                return@doHttp
                            }
                            val linkList: MutableList<LinkEntityNew> = mutableListOf()
                            linkList.add(
                                LinkEntityNew(
                                    id = 0,
                                    valueId = 0,
                                    link = type ?: "",
                                    icon = icon.toString() ?: "",
                                    mnemonic = valueInfo.mnemonics.toByteArray(),
                                    privateKey = valueInfo.privateKey.toByteArray(),
                                    address = valueInfo.address,
                                    linkId = valueInfo.id.toString(),
                                    fileName = valueInfo.fileName,
                                    "0.0", "0.0", "", isSelect = true, "",
                                    decimals = if (type == "DOT")
                                        DOTUtils.getDecimals()
                                    else
                                        18
                                )
                            )
                            //如果是BTC就加上USDT
                            if (type == "BTC") {
                                linkList.add(
                                    LinkEntityNew(
                                        id = 0,
                                        valueId = 0,
                                        link = "USDT",
                                        icon = "https://s2.gongft.com/logo/1/tether.png?x-oss-process=style/coin_72",
                                        mnemonic = valueInfo.mnemonics.toByteArray(),
                                        privateKey = valueInfo.privateKey.toByteArray(),
                                        address = valueInfo.address,
                                        linkId = valueInfo.id.toString(),
                                        fileName = valueInfo.fileName,
                                        "0.0", "1.00000000", "", isSelect = true, channel = "OMNI"
                                    )
                                )
                            }


                            lifecycleScope.launch {
                                val id = ValueDatabaseNew.get(this@CreateWalletActivity).insertValue(
                                    LocalValueEntityNew(
                                        0,
//                                        intent.getStringExtra("name") ?: "",
                                        binding.etName.string().trim(),
//                                        intent.getStringExtra("password") ?: "",
                                        binding.etPwd.string().trim(),
                                        valueInfo.mnemonics,
                                        false,
                                        linkList
                                    )
                                )
                                MySharedPreferences.put(Constants.CURRENT_VALUE, id)
                                if (isFromMetaSpace) {
                                    //跳转myvertu
                                    val intent = Intent()
                                    intent.setClassName("com.vertu.life2", "com.vertu.myvertu.activity.WelcomeActivity")
                                    intent.putExtra("isFromMetaSpace", isFromMetaSpace)
                                    startActivity(intent)
                                    AppManager.getInstance().exit0()
                                } else {
                                    //私钥导入直接进主页
                                    toast(R.string.import_success)
                                    start<MainActivity>()
                                    ObserverManager.instance.notifyObserver("")
                                    AppManager.getInstance().finishALlActivityExceptClassName(MainActivity::class.java)
                                }
                            }

                        }
                    }, {
                        toast(R.string.check_private_key)
                    })
                }
                else -> {
                    startActivity(
                        Intent(this, AddCurrencyActivity::class.java)
                            .putExtra("name", binding.etName.string())
                            .putExtra("password", binding.etPwd.string())
                            .putExtra("from", from)
                            .putExtra("info", info)
                            .putExtra("isFromMetaSpace", isFromMetaSpace)
                    )
                    finish()
                }
            }
        }
    }

    private fun enableCreate() {
        val name = binding.etName.string().trim()
        val pwd = binding.etPwd.string().trim()
        val repwd = binding.etRepwd.string().trim()
        binding.tvCreate.isEnabled = !TextUtils.isEmpty(name) && pwd.matches(regex) && pwd == repwd && binding.cbAgree.isChecked
    }

}