package com.polkadot.bt.custom

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.drawable.Drawable
import android.util.AttributeSet
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import androidx.annotation.ColorInt
import androidx.annotation.DrawableRes
import androidx.annotation.Nullable
import androidx.annotation.StringRes
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.DrawableCompat
import com.polkadot.bt.R
import com.polkadot.bt.databinding.FunctionItemBinding
import com.polkadot.bt.ext.*

/**
 * @author Heaven Created on 2022/6/15
 */
class FunctionItem : ConstraintLayout {

    private lateinit var binding: FunctionItemBinding

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
        binding = FunctionItemBinding.inflate(LayoutInflater.from(context), this)

        val a = context.obtainStyledAttributes(attrs, R.styleable.FunctionItem, defStyleAttr, 0)

        a.getDrawable(R.styleable.FunctionItem_drawable)?.let {
            binding.logo.visible()
            binding.logo.setImageDrawable(it)
        } ?: binding.logo.gone()

        a.getString(R.styleable.FunctionItem_itemText)?.let {
            binding.content.text = it
        }

        a.getDimensionPixelSize(R.styleable.FunctionItem_itemTextSize, dp2px(14)).let {
            binding.content.setTextSize(TypedValue.COMPLEX_UNIT_PX, it.toFloat())
        }

        a.getColor(R.styleable.FunctionItem_itemColor, Color.parseColor("#1B1B1C")).let {
            binding.content.setTextColor(it)
        }

        a.getString(R.styleable.FunctionItem_itemSubText)?.let {
            binding.subContent.text = it
        }

        a.getDimensionPixelSize(R.styleable.FunctionItem_itemSubTextSize, dp2px(14)).let {
            binding.subContent.setTextSize(TypedValue.COMPLEX_UNIT_PX, it.toFloat())
        }

        a.getColor(R.styleable.FunctionItem_itemSubColor, Color.parseColor("#97979C")).let {
            binding.subContent.setTextColor(it)
        }

        a.getInteger(R.styleable.FunctionItem_itemSubTextVisibility, View.VISIBLE).let {
            setSubTextVisibility(it)
        }

        a.getInteger(R.styleable.FunctionItem_arrowVisibility, View.VISIBLE).let {
            binding.arrow.visibility = it
        }

        a.recycle()
    }

    private fun tintDrawable(drawable: Drawable, colors: ColorStateList): Drawable {
        val wrappedDrawable = DrawableCompat.wrap(drawable.mutate());
        DrawableCompat.setTintList(wrappedDrawable, colors);
        return wrappedDrawable;
    }

    fun setDrawable(@DrawableRes drawableRes: Int, @ColorInt tint: Int) {
        val drawable = ContextCompat.getDrawable(context, drawableRes)
        val colors = ColorStateList.valueOf(tint)
        setDrawable(drawable, colors)
    }

    fun setDrawable(@DrawableRes drawableRes: Int, colors: ColorStateList) {
        val drawable = ContextCompat.getDrawable(context, drawableRes)
        setDrawable(drawable, colors)
    }

    fun setDrawable(drawable: Drawable?, colors: ColorStateList) {
        binding.logo.setImageDrawable(drawable?.let { tintDrawable(it, colors) })
    }

    fun isSemiBold() {
        binding.content.isSemiBold()
    }

    fun setText(@StringRes stringRes: Int) {
        binding.content.text = context.getString(stringRes)
        invalidate()
    }

    fun setText(text: String) {
        binding.content.text = text
    }

    fun setTextColor(@ColorInt color: Int) {
        binding.content.setTextColor(color)
    }

    fun setTextColor(colors: ColorStateList?) {
        if (colors == null) {
            throw NullPointerException("colors must be not null")
        }
        binding.content.setTextColor(colors)
    }

    fun setSubText(@StringRes stringRes: Int) {
        binding.subContent.text = context.getString(stringRes)
        invalidate()
    }

    fun setSubText(text: String) {
        binding.subContent.text = text
    }

    fun setSubTextColor(@ColorInt color: Int) {
        binding.subContent.setTextColor(color)
    }

    fun setSubTextColor(colors: ColorStateList?) {
        if (colors == null) {
            throw NullPointerException("colors must be not null")
        }
        binding.subContent.setTextColor(colors)
    }

    fun setSubTextVisibility(visible: Int) {
        if (visible == View.GONE) {
            binding.subContent.invisible()
        } else {
            binding.subContent.visible()
        }
    }

    fun setSubTextListener(listener: (View) -> Unit) {
        binding.subContent.setOnClickListener(listener)
    }

    fun setArrowVisibility(visible: Int) {
        binding.arrow.visibility = visible
    }
}