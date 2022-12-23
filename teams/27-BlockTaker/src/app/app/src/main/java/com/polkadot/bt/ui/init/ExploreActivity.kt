package com.polkadot.bt.ui.init

import com.polkadot.bt.databinding.ActivityExploreBinding
import com.polkadot.bt.ui.BaseVBActivity
import splitties.activities.start

class ExploreActivity : BaseVBActivity<ActivityExploreBinding>() {
    override fun initBinding() = ActivityExploreBinding.inflate(layoutInflater)

    override fun init() {
        initListeners()
    }

    private fun initListeners() {
        binding.tvExplore.setOnClickListener {
            start<MetaInitActivity>()
        }
        binding.tvIntroduce.setOnClickListener {
            start<VideoActivity>()
        }
    }
}