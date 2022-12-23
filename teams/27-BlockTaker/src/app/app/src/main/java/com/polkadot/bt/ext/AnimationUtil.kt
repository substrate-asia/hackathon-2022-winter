package com.polkadot.bt.ext

import android.view.View
import android.view.animation.Animation
import android.view.animation.TranslateAnimation


/**
 * Synopsis     动画工具类
 * Author		cx
 */
class AnimationUtil {
    private var ismHiddenActionstart = false

    /**
     * 从控件所在位置移动到控件的底部
     *
     * @param v
     * @param Duration 动画时间
     */
    fun moveToViewBottom(v: View, Duration: Long) {
        if (v.visibility != View.VISIBLE) return
        if (ismHiddenActionstart) return
        val mHiddenAction = TranslateAnimation(
            Animation.RELATIVE_TO_SELF, 0.0f,
            Animation.RELATIVE_TO_SELF, 0.0f, Animation.RELATIVE_TO_SELF,
            0.0f, Animation.RELATIVE_TO_SELF, 1.0f
        )
        mHiddenAction.duration = Duration
        v.clearAnimation()
        v.animation = mHiddenAction
        mHiddenAction.setAnimationListener(object : Animation.AnimationListener {
            override fun onAnimationStart(animation: Animation) {
                ismHiddenActionstart = true
            }

            override fun onAnimationEnd(animation: Animation) {
                v.visibility = View.GONE
                ismHiddenActionstart = false
            }

            override fun onAnimationRepeat(animation: Animation) {}
        })
    }

    /**
     * 从控件的底部移动到控件所在位置
     *
     * @param v
     * @param Duration 动画时间
     */
    fun bottomMoveToViewLocation(v: View, Duration: Long) {
        if (v.visibility == View.VISIBLE) return
        v.visibility = View.VISIBLE
        val mShowAction = TranslateAnimation(
            Animation.RELATIVE_TO_SELF, 0.0f,
            Animation.RELATIVE_TO_SELF, 0.0f, Animation.RELATIVE_TO_SELF,
            1.0f, Animation.RELATIVE_TO_SELF, 0.0f
        )
        mShowAction.duration = Duration
        v.clearAnimation()
        v.animation = mShowAction
    }

    /**
     * 从控件所在位置移动到控件的顶部
     *
     * @param v
     * @param Duration 动画时间
     */
    fun moveToViewTop(v: View, Duration: Long) {
        if (v.visibility != View.VISIBLE) return
        if (ismHiddenActionstart) return
        val mHiddenAction = TranslateAnimation(
            Animation.RELATIVE_TO_SELF, 0.0f,
            Animation.RELATIVE_TO_SELF, 0.0f, Animation.RELATIVE_TO_SELF,
            0.0f, Animation.RELATIVE_TO_SELF, -1.0f
        )
        mHiddenAction.duration = Duration
        v.clearAnimation()
        v.animation = mHiddenAction
        mHiddenAction.setAnimationListener(object : Animation.AnimationListener {
            override fun onAnimationStart(animation: Animation) {
                ismHiddenActionstart = true
            }

            override fun onAnimationEnd(animation: Animation) {
                v.visibility = View.GONE
                ismHiddenActionstart = false
            }

            override fun onAnimationRepeat(animation: Animation) {}
        })
    }

    /**
     * 从控件的顶部移动到控件所在位置
     *
     * @param v
     * @param Duration 动画时间
     */
    fun topMoveToViewLocation(v: View, Duration: Long) {
        if (v.visibility == View.VISIBLE) return
        v.visibility = View.VISIBLE
        val mShowAction = TranslateAnimation(
            Animation.RELATIVE_TO_SELF, 0.0f,
            Animation.RELATIVE_TO_SELF, 0.0f, Animation.RELATIVE_TO_SELF,
            -1.0f, Animation.RELATIVE_TO_SELF, 0.0f
        )
        mShowAction.duration = Duration
        v.clearAnimation()
        v.animation = mShowAction
    }

    companion object {
        private var mInstance: AnimationUtil? = null
        fun with(): AnimationUtil? {
            if (mInstance == null) {
                synchronized(AnimationUtil::class.java) {
                    if (mInstance == null) {
                        mInstance = AnimationUtil()
                    }
                }
            }
            return mInstance
        }
    }
}