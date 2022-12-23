package com.polkadot.bt.ui.init

import android.view.WindowManager
import com.polkadot.bt.R
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.databinding.ActivityVideoBinding
import com.polkadot.bt.ext.Utils
import com.polkadot.bt.ext.visible
import com.polkadot.bt.ui.BaseVBActivity
import splitties.activities.start

class VideoActivity : BaseVBActivity<ActivityVideoBinding>() {
    private var isFromMetaSpace = false
    private var resumePosition = 0
    override fun initBinding() = ActivityVideoBinding.inflate(layoutInflater)

    override fun init() {
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        StatusBarUtil.setTranslucent(this, 0)
        StatusBarUtil.setDarkMode(this)
        binding.videoView.keepScreenOn = true
        isFromMetaSpace = intent.getBooleanExtra("isFromMetaSpace", false)
        binding.videoView.setVideoPath(
            "android.resource://$packageName/" +
                if (isFromMetaSpace)
                    R.raw.web3os
                else if (Utils.getSystemLanguage(true).startsWith("zh"))
                    R.raw.web3
                else
                    R.raw.web3_en
        )
        binding.videoView.start()
        if (!isFromMetaSpace) {
            binding.tvBack.visible()
            binding.tvSkip.visible()
        }
        initListeners()
    }

    override fun onResume() {
        super.onResume()
        if (resumePosition != 0) {
            binding.videoView.start()
            binding.videoView.seekTo(resumePosition)
        }
    }

    override fun onPause() {
        super.onPause()
        if (binding.videoView.isPlaying) {
            binding.videoView.pause()
            resumePosition = binding.videoView.currentPosition
        }
    }

    override fun onDestroy() {
        binding.videoView.stopPlayback()
        super.onDestroy()
    }

    private fun initListeners() {
        binding.videoView.setOnCompletionListener {
            if (isFromMetaSpace) {
                binding.tvExplore.visible()
                binding.tvIntroduce.visible()
                binding.ivBg.visible()
            } else {
                start<MetaInitActivity>()
                finish()
            }
        }
        binding.tvExplore.setOnClickListener {
            start<MetaInitActivity>()
            finish()
        }
        binding.tvIntroduce.setOnClickListener {
            start<VideoActivity>()
//            finish()
        }
        binding.tvBack.setOnClickListener { finish() }
        binding.tvSkip.setOnClickListener {
            start<MetaInitActivity>()
            finish()
        }
    }
}