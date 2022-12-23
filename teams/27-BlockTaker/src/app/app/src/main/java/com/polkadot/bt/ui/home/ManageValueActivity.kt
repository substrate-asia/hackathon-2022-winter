package com.polkadot.bt.ui.home

import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.util.Log
import android.view.View
import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ManageValueActivityBinding
import com.polkadot.bt.dialog.InputPasswordDialog
import com.polkadot.bt.dialog.NormalDialog
import com.polkadot.bt.ext.*
import com.polkadot.bt.observer.ObserverManager
import com.polkadot.bt.room.ValueDatabaseNew
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.backup.BackupKeyActivity
import com.polkadot.bt.ui.backup.BackupMnemonicActivity
import kotlinx.coroutines.launch
import splitties.activities.start

class ManageValueActivity : BaseActivity<ManageValueActivityBinding>() {

    override fun initBinding() = ManageValueActivityBinding.inflate(layoutInflater)
    var password=""
    override fun init() {
        binding.walletName.setSubText(intent?.getStringExtra("name")?:"")
        binding.backupMnemonic.visibility=if (intent?.getStringExtra("mnemonic")!!.isEmpty()) View.GONE else View.VISIBLE
        binding.viewLine.visibility=if (intent?.getStringExtra("mnemonic")!!.isEmpty()) View.GONE else View.VISIBLE

        initListeners()
    }

    override fun onResume() {
        super.onResume()
        lifecycleScope.launch {
            val value=ValueDatabaseNew.get(this@ManageValueActivity).getValue(intent.getLongExtra("id",1L))
            password= value?.password!!
            binding.walletName.setSubText(value?.name!!)
        }
    }


    private fun initListeners() {
        binding.changepassword.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
                MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) == true &&
                Utils.hasBiometricEnrolled(this)) {
                Utils.useFingerprint(this, object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        // 5次属于错误
                        Log.i(TAG, "onAuthenticationError $errString")
                    }
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        // 成功
                        Log.i(TAG, "onAuthenticationSucceeded $result")
                        start<ChangePasswordActivity>{
                            putExtra("id",intent.getLongExtra("id",1L))
                        }
                    }
                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        // 单次失败
                        Log.i(TAG, "onAuthenticationFailed ")
                    }
                })
            } else {
                InputPasswordDialog(this){
                    if (it==password){
                        start<ChangePasswordActivity>{
                            putExtra("id",intent.getLongExtra("id",1L))
                        }
                    }else
                        toast(getString(R.string.password_error))
                }.show()
            }
        }
        binding.backupMnemonic.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
                MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) == true &&
                Utils.hasBiometricEnrolled(this)) {
                Utils.useFingerprint(this, object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        // 5次属于错误
                        Log.i(TAG, "onAuthenticationError $errString")
                    }
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        // 成功
                        Log.i(TAG, "onAuthenticationSucceeded $result")
                        start<BackupMnemonicActivity>{
                            putExtra("isBackup",intent?.getBooleanExtra("isBackup",false))
                            putExtra("id",intent.getLongExtra("id",1L))
                        }
                    }
                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        // 单次失败
                        Log.i(TAG, "onAuthenticationFailed ")
                    }
                })
            } else {
                InputPasswordDialog(this){
                    if (it==password){
                        start<BackupMnemonicActivity>{
                            putExtra("isBackup",intent?.getBooleanExtra("isBackup",false))
                            putExtra("id",intent.getLongExtra("id",1L))
                        }
                    }else
                        toast(getString(R.string.password_error))
                }.show()
            }
        }
        binding.backupKey.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
                MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) == true &&
                Utils.hasBiometricEnrolled(this)) {
                Utils.useFingerprint(this, object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        // 5次属于错误
                        Log.i(TAG, "onAuthenticationError $errString")
                    }
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        // 成功
                        Log.i(TAG, "onAuthenticationSucceeded $result")
                        start<BackupKeyActivity> {
                            putExtra("id",intent.getLongExtra("id",1L))
                        }
                    }
                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        // 单次失败
                        Log.i(TAG, "onAuthenticationFailed ")
                    }
                })
            } else {
                InputPasswordDialog(this){
                    if (it==password){
                        start<BackupKeyActivity> {
                            putExtra("id",intent.getLongExtra("id",1L))
                        }
                    }else
                        toast(getString(R.string.password_error))

                }.show()
            }
        }

        binding.walletName.setOnClickListener {
            start<ChangeNameActivity> {
                putExtra("id",intent.getLongExtra("id",1L))

            }
        }

        /* binding.valueName.setOnEditorActionListener(object : TextView.OnEditorActionListener{
             override fun onEditorAction(p0: TextView?, actionId: Int, p2: KeyEvent?): Boolean {
                 if (actionId==EditorInfo.IME_ACTION_SEND){
                     toast(getString(R.string.change_name))
                     if (binding.valueName.string().isEmpty()){
                         toast(getString(R.string.name_null))
                         return false
                     }
                     lifecycleScope.launch {
                         ValueDatabase.get(this@ManageValueActivity).
                         updateValueName(
                             ValueNameEntity(id = intent.getLongExtra("id",1L),
                                 binding.valueName.string()
                             )
                         )
                         ObserverManager.instance.notifyObserver("修改钱包名称")
                     }

                 }
                 return false
             }
         })*/


        binding.tvDelete.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P &&
                MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) == true &&
                Utils.hasBiometricEnrolled(this)) {
                Utils.useFingerprint(this, object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        // 5次属于错误
                        Log.i(TAG, "onAuthenticationError $errString")
                    }
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        // 成功
                        Log.i(TAG, "onAuthenticationSucceeded $result")
                        NormalDialog.build(this@ManageValueActivity) {
                            titleText=getString(R.string.delete_value)
                            contentText=getString(R.string.delete_value_dialog)
                            confirmText = getString(R.string.delete_confirm)
                            confirmClick = {
                                lifecycleScope.launch {
                                    val listValue= ValueDatabaseNew.get(context).getAllValue()
                                    if (listValue.size>1){
                                        val id=intent.getLongExtra("id",1L)
                                        val currentId= MySharedPreferences.get(Constants.CURRENT_VALUE,1L)
                                        if (id==currentId){
                                            toast(getString(R.string.no_delete_current_value))
                                            return@launch
                                        }
                                        //刪除钱包
                                        ValueDatabaseNew.get(context).deleteValue(id)
                                        //当前钱包不能删除
//                                    val listValue= ValueDatabase.get(context).getAllValue()
//                                    MySharedPreferences.put(Constants.CURRENT_VALUE, listValue[0].id)
                                        ObserverManager.instance.notifyObserver("删除钱包")
                                        finish()
                                    }else{
                                        toast(getString(R.string.no_delete_value))
                                    }
                                }
                            }
                        }.show()
                    }
                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        // 单次失败
                        Log.i(TAG, "onAuthenticationFailed ")
                    }
                })
            } else {
                InputPasswordDialog(this){
                    if (it==password){
                        NormalDialog.build(this) {
                            titleText=getString(R.string.delete_value)
                            contentText=getString(R.string.delete_value_dialog)
                            confirmText = getString(R.string.delete_confirm)
                            confirmClick = {
                                lifecycleScope.launch {
                                    val listValue= ValueDatabaseNew.get(context).getAllValue()
                                    if (listValue.size>1){
                                        val id=intent.getLongExtra("id",1L)
                                        val currentId= MySharedPreferences.get(Constants.CURRENT_VALUE,1L)
                                        if (id==currentId){
                                            toast(getString(R.string.no_delete_current_value))
                                            return@launch
                                        }
                                        //刪除钱包
                                        ValueDatabaseNew.get(context).deleteValue(id)
                                        //当前钱包不能删除
//                                    val listValue= ValueDatabase.get(context).getAllValue()
//                                    MySharedPreferences.put(Constants.CURRENT_VALUE, listValue[0].id)
                                        ObserverManager.instance.notifyObserver("删除钱包")
                                        finish()
                                    }else{
                                        toast(getString(R.string.no_delete_value))
                                    }
                                }
                            }
                        }.show()
                    }else
                        toast(getString(R.string.password_error))
                }.show()
            }
        }
    }
}
