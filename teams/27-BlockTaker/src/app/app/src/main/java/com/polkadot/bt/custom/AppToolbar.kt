package com.polkadot.bt.custom

import android.app.Activity
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.drawable.Drawable
import android.util.AttributeSet
import android.util.TypedValue
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import androidx.annotation.ColorInt
import androidx.annotation.Nullable
import androidx.annotation.StringRes
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.graphics.drawable.DrawableCompat
import com.polkadot.bt.R
import com.polkadot.bt.databinding.AppToolbarBinding
import com.polkadot.bt.ext.*

/**
 * @author Heaven Created on 2022/6/14
 */
class AppToolbar : ConstraintLayout {

    private lateinit var binding: AppToolbarBinding

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
        binding = AppToolbarBinding.inflate(LayoutInflater.from(context), this)

        val a = context.obtainStyledAttributes(attrs, R.styleable.AppToolbar, defStyleAttr, 0)

        a.getInteger(R.styleable.AppToolbar_backVisibility, View.VISIBLE).let {
            binding.back.visibility = it
        }

        a.getDrawable(R.styleable.AppToolbar_backDrawable)?.let {
            binding.back.visible()
            binding.back.setImageDrawable(it)
        }

        a.getInteger(R.styleable.AppToolbar_moreVisibility, View.GONE).let {
            if (it == View.VISIBLE) {
                binding.right.gone()
            }
            binding.more.visibility = it
        }

        a.getDrawable(R.styleable.AppToolbar_moreDrawable)?.let {
            binding.more.visible()
            binding.more.setImageDrawable(it)
        }

        a.getInteger(R.styleable.AppToolbar_titleGravity, Gravity.CENTER).let {
            binding.title.gravity = it
        }

        a.getInteger(R.styleable.AppToolbar_titleVisibility, View.VISIBLE).let {
            binding.title.visibility = it
        }

        a.getString(R.styleable.AppToolbar_title)?.let {
            binding.title.text = it
        }

        a.getColor(R.styleable.AppToolbar_color, Color.parseColor("#1B1B1C")).let {
            binding.title.setTextColor(it)
        }

        a.getColor(R.styleable.AppToolbar_filterColor, Color.parseColor("#3D000000")).let {
            binding.filter.setBackgroundColor(it)
        }

        a.getColor(R.styleable.AppToolbar_backButtonColor, Color.BLACK).let {
            binding.back.setImageDrawable(tintDrawable(binding.back.drawable, ColorStateList.valueOf(it)))
        }

        a.getInteger(R.styleable.AppToolbar_filterVisibility, View.GONE).let {
            binding.filter.visibility = it
        }

        a.getString(R.styleable.AppToolbar_rightText)?.let {
            binding.right.text = it
        }

        a.getDimensionPixelSize(R.styleable.AppToolbar_rightTextSize, dp2px(14)).let {
            binding.right.setTextSize(TypedValue.COMPLEX_UNIT_PX, it.toFloat())
        }

        a.getColor(R.styleable.AppToolbar_rightColor, Color.parseColor("#1B1B1C")).let {
            binding.right.setTextColor(it)
        }

        a.getInteger(R.styleable.AppToolbar_rightVisibility, View.GONE).let {
            if (it == View.VISIBLE) {
                binding.more.gone()
            }
            binding.right.visibility = it
        }

        binding.back.setOnClickListener {
            if (context is Activity) {
                (context as Activity).finish()
            }
        }

        binding.title.isSemiBold()
        binding.right.isSemiBold()

        a.recycle()
    }

    private fun tintDrawable(drawable: Drawable, colors: ColorStateList): Drawable {
        val wrappedDrawable = DrawableCompat.wrap(drawable.mutate());
        DrawableCompat.setTintList(wrappedDrawable, colors);
        return wrappedDrawable;
    }

    fun setTint(color: Int) {
        binding.back.setImageDrawable(tintDrawable(binding.back.drawable, ColorStateList.valueOf(color)))
        binding.more.setImageDrawable(tintDrawable(binding.more.drawable, ColorStateList.valueOf(color)))
        binding.title.setTextColor(color)
        binding.right.setTextColor(color)
    }

    fun setTitleText(@StringRes stringRes: Int) {
        binding.title.text = context.getString(stringRes)
    }

    fun setTitleText(text: String) {
        binding.title.text = text
    }

    fun setTitleColor(@ColorInt color: Int) {
        binding.title.setTextColor(color)
    }

    fun setTextColor(colors: ColorStateList?) {
        if (colors == null) {
            throw NullPointerException("colors must be not null")
        }
        binding.title.setTextColor(colors)
    }

    fun setBackVisibility(visible: Int) {
        binding.back.visibility = visible
    }

    fun setMoreVisibility(visible: Int) {
        binding.more.visibility = visible
    }

    fun setMoreListener(listener: (View) -> Unit) {
        binding.more.setOnClickListener(listener)
    }

    fun setTitleVisibility(visible: Int) {
        binding.title.visibility = visible
    }

    fun setFilterVisibility(visible: Int) {
        binding.filter.visibility = visible
    }

    fun setRightListener(listener: (View) -> Unit) {
        binding.right.setOnClickListener(listener)
    }

    fun setRightText(@StringRes stringRes: Int) {
        binding.right.text = context.getString(stringRes)
    }

    fun setRightText(text: String) {
        binding.right.text = text
    }

    fun setRightTextSize(textSize: Int) {
        binding.right.textSize = textSize.sp
    }

    fun setRightColor(@ColorInt color: Int) {
        binding.right.setTextColor(color)
    }

    fun setRightColor(colors: ColorStateList?) {
        if (colors == null) {
            throw NullPointerException("colors must be not null")
        }
        binding.right.setTextColor(colors)
    }

    fun setRightVisibility(visible: Int) {
        binding.right.visibility = visible
    }

}
