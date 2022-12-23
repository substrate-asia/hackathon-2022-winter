package com.polkadot.bt.ext

import com.google.gson.Gson
import org.web3j.utils.Numeric
import java.math.RoundingMode
import java.text.DecimalFormat
import java.util.regex.Pattern


/**
 * @author Heaven Created on 2022/6/22
 */

fun Any?.toJson(): String = Gson().toJson(this)

/**
 * 是否为手机号  0开头 12开头的不支持
 */
fun String?.isPhone(): Boolean {
    return this?.let {
        Pattern.matches(it, "0?(13|14|15|16|17|18|19)[0-9]{9}")
    } ?: false
}

/**
 * 是否为邮箱号
 */
fun String?.isEmail(): Boolean {
    return this?.let {
        Pattern.matches(this, "^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*\$")
    } ?: false
}
/**
* 对入参保留最多两位小数(舍弃末尾的0)
* */
fun getNoMoreThanTwoDigits(number: Double): String {
    val format = DecimalFormat("0.##")
    //未保留小数的舍弃规则，RoundingMode.FLOOR表示直接舍弃。
    format.roundingMode = RoundingMode.FLOOR
    return format.format(number)
}
/**
* 对入参保留最多八位小数(舍弃末尾的0)
* */
fun getNoMoreThanEightDigits(number: Double): String {
    if (number==null)
        return "0"
    val format = DecimalFormat("0.########")
    format.roundingMode = RoundingMode.FLOOR
    return format.format(number)
}


 fun replaceWhiteSpace(text: String): String {
    var original = text
    val sb = StringBuilder()
    var isFirstSpace = false //标记是否是第一个空格
    original = original.trim { it <= ' ' } //如果考虑开头和结尾有空格的情形
    var c: Char
    for (element in original) {
        c = element
        if (c == ' ' || c == '\t') { //遇到空格字符时,先判断是不是第一个空格字符
            if (!isFirstSpace) {
                sb.append(c)
                isFirstSpace = true
            }
        } else { //遇到非空格字符时
            sb.append(c)
            isFirstSpace = false
        }
    }
    return sb.toString()
}

/**
* 以太坊系列地址校验
* */

fun checkAddress(input: String?): Boolean {
    return if (null == input || "" === input || !input.startsWith("0x")) {
        false
    } else isValidAddress(input)
}

fun isValidAddress(input: String?): Boolean {
    val cleanInput = Numeric.cleanHexPrefix(input)
    try {
        Numeric.toBigIntNoPrefix(cleanInput)
    } catch (e: NumberFormatException) {
        return false
    }
    return cleanInput.length == 40
}

fun getCurrencySymbol(currency:String ):String{
    return when(currency){
        "USD"->"$"
        "CNY"->"￥"
        "EUR"->"€"
        else ->""
    }
}


