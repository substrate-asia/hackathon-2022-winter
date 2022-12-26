package com.polkadot.bt.ext

import android.graphics.Bitmap
import android.graphics.Color
import android.text.TextUtils
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.WriterException
import com.google.zxing.qrcode.QRCodeWriter
import java.util.*


object EnCodeUtils {
    /**
     * 生成指定颜色的二维码
     */
    fun createQRCodeBitmap(content: String?, color: Int): Bitmap? {
        return createQRCodeBitmap(content, 400, 400, "UTF-8", "H", "1", color, Color.WHITE)
    }

    /**
     * 生成简单二维码
     *
     * @param content                字符串内容
     * @param width                  二维码宽度
     * @param height                 二维码高度
     * @param character_set          编码方式（一般使用UTF-8）
     * @param error_correction_level 容错率 L：7% M：15% Q：25% H：35%
     * @param margin                 空白边距（二维码与边框的空白区域）
     * @param color_black            黑色色块
     * @param color_white            白色色块
     * @return BitMap
     */
    fun createQRCodeBitmap(
        content: String?, width: Int, height: Int,
        character_set: String?, error_correction_level: String?,
        margin: String?, color_black: Int, color_white: Int
    ): Bitmap? {
        // 字符串内容判空
        if (TextUtils.isEmpty(content)) {
            return null
        }
        // 宽和高>=0
        return if (width < 0 || height < 0) {
            null
        } else try {
            // 1.设置二维码相关配置
            val hints: Hashtable<EncodeHintType, String?> = Hashtable()
            // 字符转码格式设置
            if (!TextUtils.isEmpty(character_set)) {
                hints.put(EncodeHintType.CHARACTER_SET, character_set)
            }
            // 容错率设置
            if (!TextUtils.isEmpty(error_correction_level)) {
                hints.put(EncodeHintType.ERROR_CORRECTION, error_correction_level)
            }
            // 空白边距设置
            if (!TextUtils.isEmpty(margin)) {
                hints.put(EncodeHintType.MARGIN, margin)
            }
            /* 2.将配置参数传入到QRCodeWriter的encode方法生成BitMatrix(位矩阵)对象 */
            val bitMatrix =
                QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, width, height, hints)

            /* 3.创建像素数组,并根据BitMatrix(位矩阵)对象为数组元素赋颜色值 */
            val pixels = IntArray(width * height)
            for (y in 0 until height) {
                for (x in 0 until width) {
                    //bitMatrix.get(x,y)方法返回true是黑色色块，false是白色色块
                    if (bitMatrix[x, y]) {
                        pixels[y * width + x] = color_black //黑色色块像素设置
                    } else {
                        pixels[y * width + x] = color_white // 白色色块像素设置
                    }
                }
            }
            /* 4.创建Bitmap对象,根据像素数组设置Bitmap每个像素点的颜色值,并返回Bitmap对象 */
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            bitmap.setPixels(pixels, 0, width, 0, 0, width, height)
            bitmap
        } catch (e: WriterException) {
            e.printStackTrace()
            null
        }
    }

}