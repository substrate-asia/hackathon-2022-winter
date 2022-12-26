package com.polkadot.bt.module.wallet_connect

import android.animation.Animator
import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.ViewGroup
import android.view.animation.BounceInterpolator
import androidx.annotation.Nullable
import androidx.constraintlayout.widget.ConstraintLayout
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ViewWalletConnectFloatingBinding
import com.polkadot.bt.ext.dp2px


/**
 * Create:NoahZhao
 * Date:2022/9/23 11:50
 * Description:WalletConnectFloatingView
 */
class WalletConnectFloatingView : ConstraintLayout {
    private lateinit var binding: ViewWalletConnectFloatingBinding
    private var mLastRawX = 0f
    private var mLastRawY = 0f
    private val TAG = "AttachButton"
    private var isDrug = false
    private var mRootMeasuredWidth = 0
    private var mRootMeasuredHeight = 0
    private var mRootTopY = 0
    private val customIsAttach = true//是否需要自动吸边
    private val customIsDrag = true//是否可拖曳
    private var backgroundIsCircleAll = false

    constructor(context: Context) : super(context) {
        initialization(null, 0)
    }

    constructor(context: Context, @Nullable attrs: AttributeSet?) : super(context, attrs) {
        initialization(attrs, 0)
    }

    constructor(context: Context, @Nullable attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {
        initialization(attrs, defStyleAttr)
    }

    private fun initialization(@Nullable attrs: AttributeSet?, defStyleAttr: Int) {
        binding = ViewWalletConnectFloatingBinding.inflate(LayoutInflater.from(context), this)
        layoutParams = LayoutParams(dp2px(80), dp2px(45))
        setBackgroundResource(R.drawable.shape_3a3a3a_circle_left_bg)
    }

    fun initLocation() {
        val mViewGroup = parent as ViewGroup
        if (mViewGroup != null) {
            val location = IntArray(2)
            mViewGroup.getLocationInWindow(location)
            //获取父布局的高度
            mRootMeasuredHeight = mViewGroup.measuredHeight
            mRootMeasuredWidth = mViewGroup.measuredWidth
            //获取父布局顶点的坐标
            mRootTopY = location[1]
            x = (mRootMeasuredWidth - layoutParams.width).toFloat()
            y = (mRootMeasuredHeight * 0.8).toFloat()
        }
    }

    override fun dispatchTouchEvent(event: MotionEvent?): Boolean {
        super.dispatchTouchEvent(event)
        return true
    }

    override fun onTouchEvent(ev: MotionEvent): Boolean {
        //判断是否需要滑动
        if (customIsDrag) {
            //当前手指的坐标
            val mRawX = ev.rawX
            val mRawY = ev.rawY
            when (ev.action) {
                MotionEvent.ACTION_DOWN -> {
                    isDrug = false
                    //记录按下的位置
                    mLastRawX = mRawX
                    mLastRawY = mRawY
                    val mViewGroup = parent as ViewGroup
                    if (mViewGroup != null) {
                        val location = IntArray(2)
                        mViewGroup.getLocationInWindow(location)
                        //获取父布局的高度
                        mRootMeasuredHeight = mViewGroup.measuredHeight
                        mRootMeasuredWidth = mViewGroup.measuredWidth
                        //获取父布局顶点的坐标
                        mRootTopY = location[1]
                    }
                }
                MotionEvent.ACTION_MOVE -> if (mRawX >= 0 && mRawX <= mRootMeasuredWidth && mRawY >= mRootTopY && mRawY <= mRootMeasuredHeight + mRootTopY) {
                    //手指X轴滑动距离
                    val differenceValueX = mRawX - mLastRawX
                    //手指Y轴滑动距离
                    val differenceValueY = mRawY - mLastRawY
                    //判断是否为拖动操作
                    if (!isDrug) {
                        isDrug = Math.sqrt((differenceValueX * differenceValueX + differenceValueY * differenceValueY).toDouble()) >= 2
                    }
                    //获取手指按下的距离与控件本身X轴的距离
                    val ownX = x
                    //获取手指按下的距离与控件本身Y轴的距离
                    val ownY = y
                    //理论中X轴拖动的距离
                    var endX = ownX + differenceValueX
                    //理论中Y轴拖动的距离
                    var endY = ownY + differenceValueY
                    //X轴可以拖动的最大距离
                    val maxX = (mRootMeasuredWidth - width).toFloat()
                    //Y轴可以拖动的最大距离
                    val maxY = (mRootMeasuredHeight - height).toFloat()
                    //X轴边界限制
                    endX = if (endX < 0) 0F else if (endX > maxX) maxX else endX
                    //Y轴边界限制
                    endY = if (endY < 0) 0F else if (endY > maxY) maxY else endY
                    //开始移动
                    x = endX
                    y = endY
                    //记录位置
                    mLastRawX = mRawX
                    mLastRawY = mRawY
                    if (!backgroundIsCircleAll) {
                        setBackgroundResource(R.drawable.shape_3a3a3a_circle_all_bg)
                        backgroundIsCircleAll = true
                    }
                }
                MotionEvent.ACTION_UP ->                     //根据自定义属性判断是否需要贴边
                    if (customIsAttach) {
                        //判断是否为点击事件
                        if (isDrug) {
                            val center = (mRootMeasuredWidth / 2).toFloat()
                            //自动贴边
                            if (mLastRawX <= center) {
                                //向左贴边
                                this@WalletConnectFloatingView.animate()
                                    .setInterpolator(BounceInterpolator())
                                    .setDuration(500)
                                    .x(0F)
                                    .setListener(object : Animator.AnimatorListener {
                                        override fun onAnimationStart(animation: Animator?) {
                                        }

                                        override fun onAnimationEnd(animation: Animator?) {
                                            setBackgroundResource(R.drawable.shape_3a3a3a_circle_right_bg)
                                            backgroundIsCircleAll = false
                                        }

                                        override fun onAnimationCancel(animation: Animator?) {
                                        }

                                        override fun onAnimationRepeat(animation: Animator?) {
                                        }

                                    })
                                    .start()
                            } else {
                                //向右贴边
                                this@WalletConnectFloatingView.animate()
                                    .setInterpolator(BounceInterpolator())
                                    .setDuration(500)
                                    .x((mRootMeasuredWidth - width).toFloat())
                                    .setListener(object : Animator.AnimatorListener {
                                        override fun onAnimationStart(animation: Animator?) {
                                        }

                                        override fun onAnimationEnd(animation: Animator?) {
                                            setBackgroundResource(R.drawable.shape_3a3a3a_circle_left_bg)
                                            backgroundIsCircleAll = false
                                        }

                                        override fun onAnimationCancel(animation: Animator?) {
                                        }

                                        override fun onAnimationRepeat(animation: Animator?) {
                                        }

                                    })
                                    .start()
                            }
                        }
                    }
            }
        }
        //是否拦截事件
        return if (isDrug) isDrug else super.onTouchEvent(ev)
    }

}