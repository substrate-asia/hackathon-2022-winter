package com.polkadot.bt.ext

import android.app.Activity
import com.polkadot.bt.ui.main.MainActivity
import java.lang.ref.WeakReference

object ActivityManager {

    // 弱引用
    private var sCurrentActivityWeakRef: WeakReference<Activity>? = null

    //当前栈的所有Activity
    private var sActivityWeakRefList: MutableList<WeakReference<Activity>> = mutableListOf()

    fun getCurrentActivity(): Activity? = sCurrentActivityWeakRef?.get()

    fun setCurrentActivity(activity: Activity) {
        sCurrentActivityWeakRef = WeakReference(activity)
    }

    fun add(activity: Activity) {
        sActivityWeakRefList.add(WeakReference(activity))
    }

    fun remove(activity: Activity) {
        val iterator = sActivityWeakRefList.iterator()
        while (iterator.hasNext()) {
            val value = iterator.next()
            if (value.get() == activity) {
                sActivityWeakRefList.remove(value)
                return
            }
        }
    }

    fun getAllActivities(): MutableList<Activity?> {
        return sActivityWeakRefList.filter { it.get() != null }.map { it.get() }.toMutableList()
    }

    fun getMainActivity(): Activity? {
        ActivityManager.getAllActivities().forEach { activity ->
            if (activity is MainActivity) {
                return activity
            }
        }
        return null
    }

}