package com.polkadot.bt.ext

import android.graphics.Paint
import android.text.Editable
import android.widget.EditText
import android.widget.TextView
import androidx.annotation.ColorInt
import java.util.regex.Matcher
import java.util.regex.Pattern

/**
 * @author Heaven Created on 2022/6/23
 */

/**
 * 获取文本
 */
fun EditText.string(): String {
    return text.toString()
}

/**
 * 获取去除空字符串的文本
 */
fun EditText.trim(): String {
    return string().trim()
}

/**
 * 文本是否为空
 */
fun EditText.isEmpty(): Boolean {
    return string().isEmpty()
}

/**
 * 文本是否不为空
 */
fun EditText.isNotEmpty(): Boolean {
    return string().isNotEmpty()
}

/**
 * 去空字符串后文本是否为空
 */
fun EditText.isTrimEmpty(): Boolean {
    return trim().isEmpty()
}

/**
 * 文本颜色
 */
fun EditText.textColor(@ColorInt color: Int) {
    return setTextColor(color)
}

/**
 * 文本加粗
 */
fun EditText.isSemiBold(semiBold: Boolean = true) {
    paint.strokeWidth = if (semiBold) 0.25f else 0f
    paint.style = Paint.Style.FILL_AND_STROKE
}

/**
 * 获取文本
 */
fun TextView.string(): String {
    return text.toString()
}

/**
 * 获取去除空字符串的文本
 */
fun TextView.trim(): String {
    return string().trim()
}

/**
 * 文本是否为空
 */
fun TextView.isEmpty(): Boolean {
    return string().isEmpty()
}

/**
 * 文本是否不为空
 */
fun TextView.isNotEmpty(): Boolean {
    return string().isNotEmpty()
}

/**
 * 去空字符串后文本是否为空
 */
fun TextView.isTrimEmpty(): Boolean {
    return trim().isEmpty()
}

/**
 * 文本颜色
 */
fun TextView.textColor(@ColorInt color: Int) {
    return setTextColor(color)
}

/**
 * 文本加粗
 */
fun TextView.isSemiBold(semiBold: Boolean = true) {
    paint.strokeWidth = if (semiBold) 0.25f else 0f
    paint.style = Paint.Style.FILL_AND_STROKE
}

fun isSemiBold(vararg textViews: TextView) {
    textViews.forEach {
        it.isSemiBold()
    }
}
/*格式调整*/
 fun matcher(editable: Editable):Matcher{
    val regex = "^\\d+.$"
    val r = Pattern.compile(regex)
    return r.matcher(editable.toString())
}