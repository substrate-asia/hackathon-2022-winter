package com.polkadot.bt.ext

import android.annotation.SuppressLint
import android.content.Context
import android.content.ContextWrapper
import android.graphics.Color
import android.util.Log
import android.view.*
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.ColorInt
import androidx.annotation.GravityInt
import androidx.annotation.LayoutRes
import androidx.annotation.StringRes
import androidx.core.app.NotificationManagerCompat
import androidx.fragment.app.Fragment
import com.polkadot.bt.R
import splitties.init.appCtx
import splitties.systemservices.layoutInflater
import splitties.systemservices.windowManager
import java.lang.ref.WeakReference

/**
 * @author Heaven Created on 2022/6/23
 */

/**
 * 消息通知是否开启
 */
fun Context.isNotificationEnabled(): Boolean {
    val notificationManagerCompat = NotificationManagerCompat.from(this)
    return notificationManagerCompat.areNotificationsEnabled()
}

internal var weakToast: WeakReference<Toast>? = null
internal var weakMessage: WeakReference<TextView>? = null
internal var weakToastView: WeakReference<View>? = null

internal fun Context.createToast(text: String, @GravityInt gravity: Int, duration: Int, @LayoutRes layoutRes: Int, @ColorInt textColor: Int, textSize: Float): Toast {
    weakToast?.get()?.let {
        it.cancel()
        val toast = Toast(this)
        toast.view = weakToastView?.get()
        weakToast = WeakReference(toast)
    } ?: let {
        val toast = Toast(this)
        val view = LayoutInflater.from(this@createToast).inflate(layoutRes, null, false)
        val textView: TextView = view.findViewById(R.id.message)
        toast.view = view
        weakMessage = WeakReference(textView)
        weakToastView = WeakReference(view)
        weakToast = WeakReference(toast)
    }
    weakMessage?.get()?.text = text
    weakMessage?.get()?.setTextColor(textColor)
    weakMessage?.get()?.textSize = textSize
    weakToast?.get()?.setGravity(gravity, 0, if (gravity == Gravity.CENTER) 0 else 220)
    weakToast?.get()?.duration = duration
    return weakToast?.get()!!
}

fun Context.toast(@StringRes stringRes: Int, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    createToast(getString(stringRes), gravity, duration, layoutRes, textColor, textSize).show()
}

fun Fragment.toast(@StringRes stringRes: Int, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    ctx.toast(stringRes, gravity, layoutRes, textColor, textSize, duration)
}

fun View.toast(@StringRes stringRes: Int, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    context.toast(stringRes, gravity, layoutRes, textColor, textSize, duration)
}

fun toast(@StringRes stringRes: Int, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    appCtx.toast(stringRes, gravity, layoutRes, textColor, textSize, duration)
}

fun Context.toast(text: String, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    createToast(text, gravity, duration, layoutRes, textColor, textSize).show()
}

fun Fragment.toast(text: String, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    ctx.toast(text, gravity, layoutRes, textColor, textSize, duration)
}

fun View.toast(text: String, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    context.toast(text, gravity, layoutRes, textColor, textSize, duration)
}

fun toast(text: String, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    appCtx.toast(text, gravity, layoutRes, textColor, textSize, duration)
}

fun Context.toast(text: Any, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    createToast(text.toString(), gravity, duration, layoutRes, textColor, textSize).show()
}

fun Fragment.toast(text: Any, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    ctx.toast(text, gravity, layoutRes, textColor, textSize, duration)
}

fun View.toast(text: Any, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    context.toast(text, gravity, layoutRes, textColor, textSize, duration)
}

fun toast(text: Any, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_SHORT) {
    appCtx.toast(text, gravity, layoutRes, textColor, textSize, duration)
}

fun Context.longToast(@StringRes stringRes: Int, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_LONG) {
    createToast(getString(stringRes), gravity, duration, layoutRes, textColor, textSize).show()
}

fun Fragment.longToast(@StringRes stringRes: Int, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    ctx.longToast(stringRes, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

fun View.longToast(@StringRes stringRes: Int, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    context.longToast(stringRes, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

fun longToast(@StringRes stringRes: Int, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    appCtx.longToast(stringRes, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

fun Context.longToast(text: String, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_LONG) {
    createToast(text, gravity, duration, layoutRes, textColor, textSize).show()
}

fun Fragment.longToast(text: String, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    ctx.longToast(text, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

fun View.longToast(text: String, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    context.longToast(text, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

fun longToast(text: String, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    appCtx.longToast(text, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

fun Context.longToast(text: Any, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f, duration: Int = Toast.LENGTH_LONG) {
    createToast(text.toString(), gravity, duration, layoutRes, textColor, textSize).show()
}

fun Fragment.longToast(text: Any, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    ctx.longToast(text, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

fun View.longToast(text: Any, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    context.longToast(text, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

fun longToast(text: Any, @GravityInt gravity: Int = Gravity.CENTER, @LayoutRes layoutRes: Int = R.layout.toast_layout, @ColorInt textColor: Int = Color.WHITE, textSize: Float = 14f) {
    appCtx.longToast(text, gravity, layoutRes, textColor, textSize, Toast.LENGTH_LONG)
}

@PublishedApi
internal inline val Fragment.ctx: Context
    get() = context ?: appCtx

/**
 * Avoids [WindowManager.BadTokenException] on API 25.
 */
private class SafeToastCtx(ctx: Context) : ContextWrapper(ctx) {

    private val toastWindowManager by lazy(LazyThreadSafetyMode.NONE) { ToastWindowManager(baseContext.windowManager) }
    private val toastLayoutInflater by lazy(LazyThreadSafetyMode.NONE) { baseContext.layoutInflater.cloneInContext(this) }

    override fun getApplicationContext(): Context = SafeToastCtx(baseContext.applicationContext)

    override fun getSystemService(name: String): Any? = when (name) {
        Context.LAYOUT_INFLATER_SERVICE -> toastLayoutInflater
        Context.WINDOW_SERVICE -> toastWindowManager
        else -> super.getSystemService(name)
    }

    private class ToastWindowManager(private val base: WindowManager) : WindowManager by base {

        @SuppressLint("LogNotTimber") // Timber is not a dependency here, but lint passes through.
        override fun addView(view: View?, params: ViewGroup.LayoutParams?) {
            try {
                base.addView(view, params)
            } catch (e: WindowManager.BadTokenException) {
                Log.e("SafeToast", "Couldn't add Toast to WindowManager", e)
            }
        }
    }
}