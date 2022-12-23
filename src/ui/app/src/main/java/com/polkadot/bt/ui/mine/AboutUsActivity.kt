package com.polkadot.bt.ui.mine

import android.annotation.SuppressLint
import android.view.View
import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.R
import com.polkadot.bt.databinding.AboutUsActivityBinding
import com.polkadot.bt.dialog.UpdateDialog
import com.polkadot.bt.ext.isSemiBold
import com.polkadot.bt.ext.toast
import com.polkadot.bt.net.HttpUtils
import com.polkadot.bt.net.HttpUtils.doHttp
import com.polkadot.bt.ui.BaseActivity
import java.util.concurrent.CancellationException

/**
 * @author Heaven
 * @date 2022/8/5 11:18
 */
class AboutUsActivity : BaseActivity<AboutUsActivityBinding>() {

    override fun initBinding() = AboutUsActivityBinding.inflate(layoutInflater)

    @SuppressLint("SetTextI18n")
    override fun init() {
        binding.appName.isSemiBold()
        binding.version.text = "${getString(R.string.current_version)}：V${BuildConfig.VERSION_NAME}"
        binding.update.setOnClickListener {
            binding.loadingView.visibility = View.VISIBLE
            //检查更新
            lifecycleScope.doHttp({
                val response = HttpUtils.appUpdateApi.update()
                if (response.code()==200) {
                    response.body()?.let {
                        UpdateDialog(this, it).show {
                            binding.loadingView.visibility = View.GONE
                        }
                    }
                }else if (response.code()==204){
                    var toast = getString(R.string.nonewver)
                    toast(toast)
                    binding.loadingView.visibility = View.GONE
                }else{
                    binding.loadingView.visibility = View.GONE
                }
            }, {
                var toast = getString(R.string.nonewver)
                if (it is CancellationException) {
                    toast = getString(R.string.check_update_failure)
                }
                toast(toast)
                binding.loadingView.visibility = View.GONE
            })
        }
    }
}