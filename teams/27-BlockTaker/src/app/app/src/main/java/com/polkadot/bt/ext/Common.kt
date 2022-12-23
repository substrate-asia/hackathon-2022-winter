package com.polkadot.bt.ext

import android.content.ClipData
import android.content.Context
import android.content.res.Resources
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.ImageView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.LifecycleOwner
import com.bumptech.glide.Glide
import com.google.gson.reflect.TypeToken
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.R
import com.polkadot.bt.bean.RecentlyBean
import splitties.systemservices.clipboardManager
import java.text.SimpleDateFormat
import java.util.*


/**
 * @author Heaven Created on 2022/6/23
 */

/**
 * 获取状态栏高度
 */
fun Context.getStatusBarHeight(): Int {
    val resourceId = resources.getIdentifier("status_bar_height", "dimen", "android")
    return resources.getDimensionPixelSize(resourceId)
}

/**
 * 获取状态栏高度
 */
fun getStatusBarHeight(): Int {
    val resourceId = Resources.getSystem().getIdentifier("status_bar_height", "dimen", "android")
    return Resources.getSystem().getDimensionPixelSize(resourceId)
}

/**
 * 获取屏幕宽度
 */
val Context.screenWidth
    get() = resources.displayMetrics.widthPixels

/**
 * 获取屏幕宽度
 */
val screenWidth
    get() = Resources.getSystem().displayMetrics.widthPixels


/**
 * 获取屏幕高度
 */
val Context.screenHeight
    get() = resources.displayMetrics.heightPixels

/**
 * 获取屏幕高度
 */
val screenHeight
    get() = Resources.getSystem().displayMetrics.heightPixels

/**
 * Int转DP
 */
val Int.dp: Int
    get() {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            this.toFloat(),
            Resources.getSystem().displayMetrics
        ).toInt()
    }

/**
 * Float转DP
 */
val Float.dp: Float
    get() {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            this,
            Resources.getSystem().displayMetrics
        )
    }


/**
 * Int转SP
 */
val Int.sp: Float
    get() {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_SP,
            this.toFloat(),
            Resources.getSystem().displayMetrics
        )
    }

/**
 * Float转SP
 */
val Float.sp: Float
    get() {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_SP,
            this,
            Resources.getSystem().displayMetrics
        )
    }

/**
 * dp值转换为px
 */
fun Context.dp2px(dp: Int): Int {
    val scale = resources.displayMetrics.density
    return (dp * scale + 0.5f).toInt()
}

/**
 * px值转换成dp
 */
fun Context.px2dp(px: Int): Int {
    val scale = resources.displayMetrics.density
    return (px / scale + 0.5f).toInt()
}

/**
 * dp值转换为px
 */
fun View.dp2px(dp: Int): Int {
    val scale = resources.displayMetrics.density
    return (dp * scale + 0.5f).toInt()
}

/**
 * px值转换成dp
 */
fun View.px2dp(px: Int): Int {
    val scale = resources.displayMetrics.density
    return (px / scale + 0.5f).toInt()
}

/**
 * 复制文本到粘贴板
 */
fun copyToClipboard(context: Context,text: String, label: String = BuildConfig.APPLICATION_ID) {
    val clipData = ClipData.newPlainText(label, text)
    clipboardManager.setPrimaryClip(clipData)
    toast(context.getString(R.string.copy_success), Gravity.CENTER)
}

/**
 * 防止重复点击事件 默认0.5秒内不可重复点击
 * @param interval [Long] 时间间隔 默认0.5秒
 * @param action [(view: View) -> Unit] 执行方法
 */
var lastClickTime = 0L
inline fun View.clickNoRepeat(interval: Long = 500, crossinline action: (view: View) -> Unit) {
    setOnClickListener {
        val currentTime = System.currentTimeMillis()
        if (lastClickTime != 0L && (currentTime - lastClickTime < interval)) {
            return@setOnClickListener
        }
        lastClickTime = currentTime
        action.invoke(it)
    }
}

fun loadImage(context: Context, url: String, view: ImageView?) {
    view?.let {
        Glide.with(context)
            .load(url)
            .error(R.drawable.ic_coin_error)
            .placeholder(R.drawable.ic_coin_error)
            .into(it)
    }
}

fun loadImage(context: Context, url: Int, view: ImageView?) {
    view?.let {
        Glide.with(context)
            .load(url)
            .error(R.drawable.ic_coin_error)
            .placeholder(R.drawable.ic_coin_error)
            .into(it)
    }
}


/**
 * 设置view显示
 */
fun View.visible() {
    visibility = View.VISIBLE
}


/**
 * 设置view占位隐藏
 */
fun View.invisible() {
    visibility = View.INVISIBLE
}

/**
 * 设置view隐藏
 */
fun View.gone() {
    visibility = View.GONE
}

/**
 * 根据条件设置view显示隐藏 为true 显示，为false 隐藏
 */
fun View.visibleOrGone(flag: Boolean) {
    visibility = if (flag) {
        View.VISIBLE
    } else {
        View.GONE
    }
}

/**
 * 根据条件设置view显示隐藏 为true 显示，为false 隐藏
 */
fun View.visibleOrInvisible(flag: Boolean) {
    visibility = if (flag) {
        View.VISIBLE
    } else {
        View.INVISIBLE
    }
}
/*
* vie转图片
* */
fun getViewToBitmap(view: View): Bitmap? {
    //创建Bitmap,最后一个参数代表图片的质量.
    val bitmap = Bitmap.createBitmap(view.width, view.height, Bitmap.Config.ARGB_8888)
    //创建Canvas，并传入Bitmap.
    val canvas = Canvas(bitmap)
    //View把内容绘制到canvas上，同时保存在bitmap.
    view.draw(canvas)
    return bitmap
}


inline fun Lifecycle.addObserver(crossinline observer: (source: LifecycleOwner, event: Lifecycle.Event) -> Unit) {
    addObserver(object : LifecycleEventObserver {
        override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
            observer.invoke(source, event)
        }
    })
}

inline fun Lifecycle.addObserver(crossinline observer: (observer: LifecycleEventObserver, source: LifecycleOwner, event: Lifecycle.Event) -> Unit) {
    addObserver(object : LifecycleEventObserver {
        override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
            observer.invoke(this, source, event)
        }
    })
}

fun click(vararg views: View, listener: (View) -> Unit) {
    views.forEach {
        it.setOnClickListener(listener)
    }
}

/*10位时间戳转换为时间*/
fun transDate(time: String): String {
    val format = SimpleDateFormat("yyyy-MM-dd HH:mm")
    return format.format(Date(time.toLong() * 1000L))
}
/*10位时间戳转换为时间*/
fun transDate(time: Long): String {
    val format = SimpleDateFormat("yyyy-MM-dd HH:mm")
    return format.format(Date(time))
}

fun addHistory(icon: String?, url: String, title: String, desc: String, type: Int = 1, add: Boolean = true) {
    try {
        val key = if (type == 0) "collection_item" else "recently_item"
        val item = MySharedPreferences.getString(key, "")
        val data = if (item.isNullOrEmpty() || item == "[]") {
            mutableListOf<RecentlyBean>()
        } else {
            MySharedPreferences.gson.fromJson(item, object : TypeToken<MutableList<RecentlyBean>>() {}.type)
        }
        val removed = mutableListOf<RecentlyBean>()
        data.forEach {
            if (it.url == url && it.title == title) {
                removed.add(it)
            }
        }
        data.removeAll(removed)
        if (add) {
            data.add(0, RecentlyBean(icon, url, title, desc))
        }
        MySharedPreferences.put(key, data)
    } catch (e: Exception) {
        e.printStackTrace()
    }
}

fun hasCollect(url: String, title: String): Boolean {
    return try {
        val key = "collection_item"
        val item = MySharedPreferences.getString(key, "")
        val data = if (item.isNullOrEmpty() || item == "[]") {
            mutableListOf<RecentlyBean>()
        } else {
            MySharedPreferences.gson.fromJson(item, object : TypeToken<MutableList<RecentlyBean>>() {}.type)
        }
        data.forEach {
            if (it.url == url && it.title == title) {
                return true
            }
        }
        false
    } catch (e: Exception) {
        e.printStackTrace()
        false
    }
}

