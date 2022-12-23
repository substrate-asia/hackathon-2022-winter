package com.polkadot.bt.ui.mine

import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.R
import com.blankj.utilcode.util.BarUtils
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.databinding.MineFragmentBinding
import com.polkadot.bt.ext.*
import com.polkadot.bt.ui.BaseFragment
import kotlinx.coroutines.launch
import splitties.fragments.start

/**
 * @author Heaven
 * @date 2022/8/4 11:17
 */
class MineFragment : BaseFragment<MineFragmentBinding>() {

    override fun initBinding(container: ViewGroup?) =
        MineFragmentBinding.inflate(layoutInflater, container, false)

    override fun onHiddenChanged(hidden: Boolean) {
        super.onHiddenChanged(hidden)
        if (!hidden){
            StatusBarUtil.setLightMode(requireActivity())
            BarUtils.transparentStatusBar(requireActivity())
            (binding.toolbar.layoutParams as ViewGroup.MarginLayoutParams).topMargin = StatusBarUtil.getStatusBarHeight(requireContext())
        }
    }

    override fun onResume() {
        super.onResume()
        binding.switchFingerprint.isChecked = MySharedPreferences.getBoolean(Constants.FINGERPRINT_ENABLE, false) ?: false && Utils.hasBiometricEnrolled(requireContext())
    }

    override fun init() {
        if (Utils.isHardwareAvailable(requireContext()))
            binding.llFingerprint.visible()
        binding.addressBook.setOnClickListener {
            start<AddressBookActivity>()
        }
        binding.language.setOnClickListener {
            start<LanguageActivity>()
        }
        binding.currencyUnit.setOnClickListener {
            start<CurrencyActivity>()
        }
        binding.aboutUs.setOnClickListener {
            start<AboutUsActivity>()
        }
        binding.switchFingerprint.setOnCheckedChangeListener { buttonView, b ->
            var fingerprintEnable = false
            if (b) {
                if (Utils.hasBiometricEnrolled(requireContext()))
                    fingerprintEnable = true
                else {
                    toast(getString(R.string.no_fingerprint))
                    buttonView.isChecked = false
                }
            }
            MySharedPreferences.put(Constants.FINGERPRINT_ENABLE, fingerprintEnable)
        }
        lifecycleScope.launch {
            val language=MySharedPreferences.get("language", Utils.getSystemLanguage(true))
            binding.language.setSubText(
                when(language){
                    "zh-cn"->getString(R.string.simplified_chinese)
                    "zh-tw"->getString(R.string.traditional_chinese)
                    else->{
                        if (language.startsWith("en"))
                            getString(R.string.english)
                        else ""
                    }
                }
            )
            val currency=MySharedPreferences.get("currency", "USD")
            binding.currencyUnit.setSubText(currency)
        }
    }
}