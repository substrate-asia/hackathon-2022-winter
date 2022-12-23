package com.polkadot.bt.ui.channel

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentStatePagerAdapter
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityImportBinding
import com.polkadot.bt.ext.gone
import com.polkadot.bt.ui.BaseVBActivity

class ImportActivity : BaseVBActivity<ActivityImportBinding>() {
    companion object {
        const val MNEMONIC = "Mnemonic"
        const val KEY = "key"
    }
    var isFromMetaSpace = false
    override fun initBinding() = ActivityImportBinding.inflate(layoutInflater)

    override fun init() {
        isFromMetaSpace = intent.getBooleanExtra("isFromMetaSpace", false)
        binding.baseTitle.tvTitle.text = getString(R.string.init_import)
        val tabTitle = arrayListOf(getString(R.string.mnemonic_import), getString(R.string.key_import))
        val fragmentList = arrayListOf(ImportFragment.getInstance(MNEMONIC), ImportFragment.getInstance(KEY))
        if (isFromMetaSpace) {
            tabTitle.removeLast()
            fragmentList.removeLast()
            binding.tab.gone()
        }

        binding.viewpager.adapter = object : FragmentStatePagerAdapter(supportFragmentManager, BEHAVIOR_RESUME_ONLY_CURRENT_FRAGMENT) {
            override fun getCount(): Int {
                return tabTitle.size
            }
            override fun getItem(position: Int): Fragment {
                return fragmentList[position]
            }
            override fun getPageTitle(position: Int): CharSequence {
                return tabTitle[position]
            }
        }
        binding.viewpager.offscreenPageLimit = tabTitle.size
        binding.tab.setupWithViewPager(binding.viewpager)
        initListeners()
    }

    private fun initListeners() {
        binding.baseTitle.ivBack.setOnClickListener {
            finish()
        }
    }
}