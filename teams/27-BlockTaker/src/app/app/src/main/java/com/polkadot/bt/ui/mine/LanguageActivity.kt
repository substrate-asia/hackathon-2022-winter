package com.polkadot.bt.ui.mine

import android.content.Intent
import android.os.Build
import android.view.View
import androidx.lifecycle.MutableLiveData
import com.polkadot.bt.App.Companion.context
import com.polkadot.bt.custom.RadioCheckItem
import com.polkadot.bt.databinding.LanguageActivityBinding
import com.polkadot.bt.ext.LanguageUtil
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ext.Utils
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.main.MainActivity
import java.lang.ref.WeakReference


class LanguageActivity : BaseActivity<LanguageActivityBinding>() {

    private val widgets = mutableListOf<WeakReference<View>>()
    private var position = 0
    private val mutableLiveData = MutableLiveData(position)

    override fun initBinding() = LanguageActivityBinding.inflate(layoutInflater)

    override fun init() {
        binding.chinese.isSemiBold()
        binding.english.isSemiBold()
        binding.ftChinese.isSemiBold()
        widgets.add(WeakReference(binding.english))
        widgets.add(WeakReference(binding.chinese))
        widgets.add(WeakReference(binding.ftChinese))
        val language=MySharedPreferences.get("language",Utils.getSystemLanguage(true))
         position=when(language){
                 "zh-cn"->1
                 "zh-tw"->2
                 else->0
         }
        (widgets[position].get()as RadioCheckItem).setChecked(true)

        widgets.forEachIndexed { index, reference ->
            if (reference.get() is RadioCheckItem) {
                (reference.get() as RadioCheckItem).setClickListener {
                    if (index!=position){
                        (widgets[position].get() as RadioCheckItem).setChecked(false)
                        position = index
                        mutableLiveData.postValue(position)
                        (widgets[position].get() as RadioCheckItem).setChecked(true)
                        changeLanguage(position)
                    }
                }
            }
        }

        mutableLiveData.observe(this) {

        }
    }

    private fun changeLanguage(position: Int) {
        var language=when(position){
            1 ->"zh-cn"
            2 ->"zh-tw"
            else-> "en-us"
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            LanguageUtil.changeAppLanguage(context, language)
        }
        MySharedPreferences.put("language",language)
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
        finish()
    }
}
