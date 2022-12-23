package com.polkadot.bt.ui.mine

import android.content.Intent
import android.view.View
import androidx.lifecycle.MutableLiveData
import com.polkadot.bt.custom.RadioCheckItem
import com.polkadot.bt.databinding.CurrencyActivityBinding
import com.polkadot.bt.ext.MySharedPreferences
import com.polkadot.bt.ui.BaseActivity
import com.polkadot.bt.ui.main.MainActivity
import java.lang.ref.WeakReference

/**
 * @author Heaven
 * @date 2022/8/5 11:07
 */
class CurrencyActivity : BaseActivity<CurrencyActivityBinding>() {

    private val widgets = mutableListOf<WeakReference<View>>()
    private var position = 1
    private val mutableLiveData = MutableLiveData(position)

    override fun initBinding() = CurrencyActivityBinding.inflate(layoutInflater)

    override fun init() {
        binding.cny.isSemiBold()
        binding.usd.isSemiBold()
        binding.eur.isSemiBold()
        widgets.add(WeakReference(binding.cny))
        widgets.add(WeakReference(binding.usd))
        widgets.add(WeakReference(binding.eur))
        val currency=MySharedPreferences.get("currency", "USD")
        position=when(currency){
            "CNY"->0
            "EUR"->2
            else->1
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
                        changeUnit(position)
                    }
                }
            }
        }

        mutableLiveData.observe(this) {

        }
    }

    private fun changeUnit(position:Int){
        val currency=when(position){
            0-> "CNY"
            2-> "EUR"
            else-> "USD"
        }
        MySharedPreferences.put("currency",currency)
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
        finish()
    }
}
