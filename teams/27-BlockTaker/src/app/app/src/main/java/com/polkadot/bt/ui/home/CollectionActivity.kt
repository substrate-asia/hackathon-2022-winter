package com.polkadot.bt.ui.home

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.provider.MediaStore
import androidx.lifecycle.lifecycleScope
import com.polkadot.bt.R
import com.polkadot.bt.custom.StatusBarUtil
import com.polkadot.bt.databinding.CollectionActivityBinding
import com.polkadot.bt.dialog.ShareDialog
import com.polkadot.bt.ext.EnCodeUtils
import com.polkadot.bt.ext.copyToClipboard
import com.polkadot.bt.ext.string
import com.polkadot.bt.ui.BaseActivity
import kotlinx.coroutines.launch
import splitties.views.imageDrawable

class CollectionActivity : BaseActivity<CollectionActivityBinding>() {

    override fun initBinding() = CollectionActivityBinding.inflate(layoutInflater)

    @SuppressLint("SetTextI18n")
    override fun init() {
        StatusBarUtil.setDarkMode(this)
        StatusBarUtil.setTranslucent(this, 255)
        binding.toolbar.setTint(Color.WHITE)
        val address=intent.getStringExtra("address")
        binding.address.text = address

        binding.toolbar.setMoreListener {
            ShareDialog(this,binding.code.imageDrawable!! , address!!) {
                val uri = Uri.parse(MediaStore.Images.Media.insertImage(contentResolver, it, null,null))
              share("value",uri)
            }.show()
        }
        binding.copy.setOnClickListener {
            copyToClipboard(this,binding.address.string())
        }

        lifecycleScope.launch {
           val codeBitmap= EnCodeUtils.createQRCodeBitmap(address,R.color.black)
            binding.code.setImageBitmap(codeBitmap)
        }
    }

    fun share(content: String, uri: Uri?) {
        val shareIntent = Intent(Intent.ACTION_SEND)
        if (uri != null) {
            //uri 是图片的地址
            shareIntent.putExtra(Intent.EXTRA_STREAM, uri)
            shareIntent.type = "image/*"
            //当用户选择短信时使用sms_body取得文字
            shareIntent.putExtra("sms_body", content)
        } else {
            shareIntent.type = "text/plain"
        }
        shareIntent.putExtra(Intent.EXTRA_TEXT, content)
        //自己定义选择框的标题
        //startActivity(Intent.createChooser(shareIntent, "邀请好友"));
        //系统默认标题
        startActivity(shareIntent)
    }
}
