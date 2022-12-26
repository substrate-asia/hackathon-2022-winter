package com.polkadot.bt.ui.home

import android.text.TextUtils
import android.text.method.HideReturnsTransformationMethod
import android.text.method.PasswordTransformationMethod
import android.view.View
import androidx.core.widget.addTextChangedListener
import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ChangePasswordActivityBinding
import com.polkadot.bt.ext.string
import com.polkadot.bt.ext.toast
import com.polkadot.bt.observer.ObserverManager
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.room.entities.ValuePasswordEntity
import com.polkadot.bt.ui.BaseActivity
import kotlinx.coroutines.launch

class ChangePasswordActivity : BaseActivity<ChangePasswordActivityBinding>() {
//    private val regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[\\s\\S]{8,16}\$".toRegex()
    private val regex = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,16}\$".toRegex()

    override fun initBinding()=ChangePasswordActivityBinding.inflate(layoutInflater)

    override fun init() {
        binding.etPwd.addTextChangedListener {
            binding.ivPwd.visibility = if (TextUtils.isEmpty(it)) View.GONE else View.VISIBLE
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

        binding.tvCreate.setOnClickListener {
            lifecycleScope.launch {
                ValueDatabaseNew.get(this@ChangePasswordActivity).
                updateValuePassword(
                    ValuePasswordEntity(id = intent.getLongExtra("id",1L),
                        password = binding.etPwd.string().trim().toByteArray()
                    )
                )
                toast(getString(R.string.change_password_success))
                ObserverManager.instance.notifyObserver("修改密码同步到主页刷新")
                finish()

            }
        }

    }

    private fun enableCreate() {
        val pwd = binding.etPwd.string().trim()
        val repwd = binding.etRepwd.string().trim()
        binding.tvCreate.isEnabled =  pwd.matches(regex) && pwd == repwd
    }
}

