package com.polkadot.bt.ext

import android.view.GestureDetector
import android.view.GestureDetector.SimpleOnGestureListener
import android.view.MotionEvent
import androidx.core.view.GestureDetectorCompat
import androidx.recyclerview.widget.ItemTouchHelper

/**
 * @author Heaven
 * @date 2022/9/19 17:06
 */
class ListenerInterceptor(helper: ItemTouchHelper) {
    private var mListener2BeIntercept: GestureDetector.OnGestureListener? = null
    private val mListener2Intercept: InterceptListener
    private var mDoDrag = true

    init {
        mListener2Intercept = InterceptListener()
        try {
            val fGesDetector = ItemTouchHelper::class.java.getDeclaredField("mGestureDetector")
            fGesDetector.isAccessible = true
            val objGesDetector = fGesDetector[helper]
            val mImpl = GestureDetectorCompat::class.java.getDeclaredField("mImpl")
            mImpl.isAccessible = true
            val objImpl = mImpl[objGesDetector]
            val mListener = objImpl.javaClass.getDeclaredField("mListener")
            val mDetector = objImpl.javaClass.getDeclaredField("mDetector")
            mDetector.isAccessible = true
            val oDet = mDetector.get(objImpl)
            mListener.isAccessible = true
            mListener2BeIntercept = mListener[oDet] as GestureDetector.OnGestureListener
            mListener[oDet] = mListener2Intercept
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun setDoDrag(drag: Boolean) {
        mDoDrag = drag
    }

    inner class InterceptListener : SimpleOnGestureListener() {
        override fun onShowPress(e: MotionEvent) {
            if (mDoDrag) mListener2BeIntercept!!.onLongPress(e)
        }
    }
}