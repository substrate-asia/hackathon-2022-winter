package com.polkadot.bt.ext

import android.annotation.SuppressLint
import android.content.Context
import android.database.Cursor
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import androidx.core.content.contentValuesOf
import androidx.exifinterface.media.ExifInterface
import com.polkadot.bt.ext.Type.*
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*


/**
 * @author Heaven Created on 2022/6/24
 */

/**
 * 文件类型
 * @property JPEG jpeg格式图片
 * @property PNG PNG格式图片
 * @property MP3 MP3格式音频
 * @property [MP4] MP4格式视频
 */
enum class Type {
    JPEG,
    PNG,
    MP3,
    MP4,
}

/**
 * 获取 [Uri]
 * @param type [Type]
 * @return uri [Uri]
 */
fun Context.getUri(type: Type = JPEG): Uri? {
    val mimeType = getMimeType(type)
    val fileName = getFilename(type)
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        // Android 10 及以上获取图片uri
        val values = contentValuesOf(
            Pair(MediaStore.MediaColumns.DISPLAY_NAME, fileName),
            Pair(MediaStore.MediaColumns.MIME_TYPE, mimeType),
            Pair(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DCIM)
        )
        contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
    } else {
        // Android 9 及以下获取图片uri
        FileProvider.getUriForFile(
            this, "${packageName}.provider",
            File(Environment.getExternalStorageDirectory(), "/DCIM/$fileName")
        )
    }
}

/**
 * 返回文件类型
 * @param type [Type]
 */
fun getMimeType(type: Type = JPEG): String {
    return when (type) {
        JPEG -> "image/jpeg"
        PNG -> "image/png"
        MP3 -> "audio/mp3"
        MP4 -> "video/mp4"
    }
}

/**
 * 返回文件名
 * @param type [Type]
 * @return [图片]使用 IMG_ 作为前缀
 *  [音频]使用 AUDIO_ 作为前缀
 *  [视频]使用 VIDEO_ 作为前缀
 */
fun getFilename(type: Type = JPEG): String {
    return when (type) {
        JPEG -> "IMG_${getCurrentTime()}.jpg"
        PNG -> "IMG_${getCurrentTime()}.png"
        MP3 -> "AUDIO_${getCurrentTime()}.MP3"
        MP4 -> "VIDEO_${getCurrentTime()}.MP4"
    }
}

/**
 * 获取当前时间
 * @return 返回 yyyyMMddHHmmss 格式的时间
 */
fun getCurrentTime(): String {
    val format = SimpleDateFormat("yyyyMMddHHmmss", Locale.getDefault())
    return format.format(Date())
}

/**
 * 通过uri获取图片并进行压缩
 *
 * @param uri
 */
fun getBitmapFormUri(context: Context, uri: Uri?): Bitmap? {
    if (uri == null) {
        return null
    }
    val input = context.contentResolver.openInputStream(uri)
    val onlyBoundsOptions = BitmapFactory.Options()
    onlyBoundsOptions.inJustDecodeBounds = true
    onlyBoundsOptions.inDither = true //optional
    onlyBoundsOptions.inPreferredConfig = Bitmap.Config.ARGB_8888 //optional
    val bitmap = BitmapFactory.decodeStream(input, null, onlyBoundsOptions)
    input?.close()
    return bitmap
//    input?.close()
//    val originalWidth = onlyBoundsOptions.outWidth
//    val originalHeight = onlyBoundsOptions.outHeight
//    if (originalWidth == -1 || originalHeight == -1) return null
//    //图片分辨率以480x800为标准
//    val hh = 800f //这里设置高度为800f
//    val ww = 480f //这里设置宽度为480f
//    //缩放比。由于是固定比例缩放，只用高或者宽其中一个数据进行计算即可
//    var be = 1 //be=1表示不缩放
//    if (originalWidth > originalHeight && originalWidth > ww) { //如果宽度大的话根据宽度固定大小缩放
//        be = (originalWidth / ww).toInt()
//    } else if (originalWidth < originalHeight && originalHeight > hh) { //如果高度高的话根据宽度固定大小缩放
//        be = (originalHeight / hh).toInt()
//    }
//    if (be <= 0) be = 1
//    //比例压缩
//    val bitmapOptions = BitmapFactory.Options()
//    bitmapOptions.inSampleSize = be //设置缩放比例
//    bitmapOptions.inDither = true //optional
//    bitmapOptions.inPreferredConfig = Bitmap.Config.ARGB_8888 //optional
//    input = context.contentResolver.openInputStream(uri)
//    val bitmap = BitmapFactory.decodeStream(input, null, bitmapOptions)
//    input?.close()
//    val file = getFileFromMediaUri(context, uri)
//    val degree: Int = getBitmapDegree(file!!.absolutePath)
//    return compressImage(bitmap, degree) //再进行质量压缩
}

/**
 * 质量压缩方法
 *
 * @param image
 * @return
 */
fun compressImage(image: Bitmap?, degree: Int): Bitmap? {
    val baos = ByteArrayOutputStream()
    image?.compress(Bitmap.CompressFormat.JPEG, 100, baos) //质量压缩方法，这里100表示不压缩，把压缩后的数据存放到baos中
    var options = 100
    while (baos.toByteArray().size / 1024 > 100) {  //循环判断如果压缩后图片是否大于100kb,大于继续压缩
        baos.reset() //重置baos即清空baos
        //第一个参数 ：图片格式 ，第二个参数： 图片质量，100为最高，0为最差  ，第三个参数：保存压缩后的数据的流
        image?.compress(Bitmap.CompressFormat.JPEG, options, baos) //这里压缩options%，把压缩后的数据存放到baos中
        options -= 10 //每次都减少10
    }
    val isBm = ByteArrayInputStream(baos.toByteArray()) //把压缩后的数据baos存放到ByteArrayInputStream中
    val bitmap = BitmapFactory.decodeStream(isBm, null, null)
    return rotateBitmapByDegree(bitmap, degree)
}

/**
 * 通过Uri获取文件
 * @param ac
 * @param uri
 * @return
 */
@SuppressLint("Range")
fun getFileFromMediaUri(context: Context, uri: Uri): File? {
    if (uri.scheme.toString().compareTo("content") == 0) {
        val cr = context.contentResolver
        val cursor: Cursor? = cr.query(uri, null, null, null, null) // 根据Uri从数据库中找
        if (cursor != null) {
            cursor.moveToFirst()
            val filePath: String = cursor.getString(cursor.getColumnIndex("_data")) // 获取图片路径
            cursor.close()
            return File(filePath)
        }
    } else if (uri.scheme.toString().compareTo("file") == 0) {
        return File(uri.toString().replace("file://", ""))
    }
    return null
}

/**
 * 读取图片的旋转的角度
 *
 * @param path 图片绝对路径
 * @return 图片的旋转角度
 */
fun getBitmapDegree(path: String?): Int {
    if (path == null) {
        return 0
    }
    var degree = 0
    try {
        // 从指定路径下读取图片，并获取其EXIF信息
        val exifInterface = ExifInterface(path)
        // 获取图片的旋转信息
        val orientation: Int = exifInterface.getAttributeInt(
            ExifInterface.TAG_ORIENTATION,
            ExifInterface.ORIENTATION_NORMAL
        )
        when (orientation) {
            ExifInterface.ORIENTATION_ROTATE_90 -> degree = 90
            ExifInterface.ORIENTATION_ROTATE_180 -> degree = 180
            ExifInterface.ORIENTATION_ROTATE_270 -> degree = 270
        }
    } catch (e: IOException) {
        e.printStackTrace()
    }
    return degree
}

/**
 * 将图片按照某个角度进行旋转
 *
 * @param bm     需要旋转的图片
 * @param degree 旋转角度
 * @return 旋转后的图片
 */
fun rotateBitmapByDegree(bm: Bitmap?, degree: Int): Bitmap? {
    if (bm == null) {
        return null
    }
    var returnBm: Bitmap? = null
    // 根据旋转角度，生成旋转矩阵
    val matrix = Matrix()
    matrix.postRotate(degree.toFloat())
    try {
        // 将原始图片按照旋转矩阵进行旋转，并得到新的图片
        returnBm = Bitmap.createBitmap(bm, 0, 0, bm.width, bm.height, matrix, true)
    } catch (e: OutOfMemoryError) {
    }
    if (returnBm == null) {
        returnBm = bm
    }
    if (bm != returnBm) {
        bm.recycle()
    }
    return returnBm
}