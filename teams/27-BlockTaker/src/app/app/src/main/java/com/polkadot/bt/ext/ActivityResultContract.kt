package com.polkadot.bt.ext

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import androidx.activity.result.contract.ActivityResultContract
import androidx.core.content.FileProvider
import androidx.core.content.contentValuesOf
import java.io.File

/**
 * @author Heaven Created on 2022/6/24
 */

/**
 * 选择照片的协定
 */
class SelectPhotoContract : ActivityResultContract<Unit?, Uri?>() {

    override fun createIntent(context: Context, input: Unit?): Intent {
        return Intent(Intent.ACTION_PICK).setType("image/*")
    }

    override fun parseResult(resultCode: Int, intent: Intent?): Uri? {
        return intent?.data
    }
}

/**
 * 拍照协定
 */
class TakePhotoContract : ActivityResultContract<Unit?, Uri?>() {

    private var uri: Uri? = null

    override fun createIntent(context: Context, input: Unit?): Intent {
        uri = context.getUri()
        return Intent(MediaStore.ACTION_IMAGE_CAPTURE).putExtra(MediaStore.EXTRA_OUTPUT, uri)
    }

    override fun parseResult(resultCode: Int, intent: Intent?): Uri? {
        if (resultCode == Activity.RESULT_OK) return uri
        return null
    }
}

/**
 * 裁剪照片的协定
 */
class CropPhotoContract : ActivityResultContract<Uri, CropPhotoContract.CropOutput?>() {

    private var output: CropOutput? = null

    override fun createIntent(context: Context, input: Uri): Intent {
        // 获取输入图片uri的媒体类型
        val mimeType = context.contentResolver.getType(input)
        // 创建新的图片名称
        val fileName = "IMG_${getCurrentTime()}.${
            MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType)
        }"
        val outputUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10 及以上获取图片uri
            val values = contentValuesOf(
                Pair(MediaStore.MediaColumns.DISPLAY_NAME, fileName),
                Pair(MediaStore.MediaColumns.MIME_TYPE, mimeType),
                Pair(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DCIM)
            )
            context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
        } else {
//            Uri.fromFile(File(Environment.getExternalStorageDirectory(), "/DCIM/$fileName"))
            // Android 9 及以下获取图片uri
            FileProvider.getUriForFile(
                context, "${context.packageName}.provider",
                File(Environment.getExternalStorageDirectory(), "/DCIM/$fileName")
            )
        }
        outputUri?.let {
            output = CropOutput(it, fileName)
            return Intent("com.android.camera.action.CROP")
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    .setDataAndType(input, "image/*")
                    .putExtra("outputX", 300)
                    .putExtra("outputY", 300)
                    .putExtra("aspectX", 1)
                    .putExtra("aspectY", 1)
                    .putExtra("scale", true)
                    .putExtra("crop", true)
                    .putExtra("return-data", false) // 在小米手机部分机型中 如果直接返回Data给Intent，图片过大的时候会有问题
                    .putExtra("noFaceDetection", true)
                    .putExtra(MediaStore.EXTRA_OUTPUT, outputUri)
                    .putExtra("outputFormat", Bitmap.CompressFormat.JPEG.toString())
        }.let {
            throw Exception("can not obtain uri")
        }
    }

    override fun parseResult(resultCode: Int, intent: Intent?): CropOutput? {
        if (resultCode == Activity.RESULT_OK) return output
        return null
    }

    data class CropOutput(val uri: Uri, val fileName: String) {
        override fun toString(): String {
            return "{ uri: $uri, fileName: $fileName }"
        }
    }
}

