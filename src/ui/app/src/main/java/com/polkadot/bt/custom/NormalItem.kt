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
import com.polkadot.bt.databinding.NormalItemBinding
import com.polkadot.bt.ext.*

/**
 * @author Heaven Created on 2022/6/15
 */
class NormalItem : ConstraintLayout {

    private lateinit var binding: NormalItemBinding

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
        binding = NormalItemBinding.inflate(LayoutInflater.from(context), this)

        val a = context.obtainStyledAttributes(attrs, R.styleable.NormalItem, defStyleAttr, 0)

        a.getDrawable(R.styleable.NormalItem_normalLeftDrawable)?.let {
            binding.logo.visible()
            binding.logo.setImageDrawable(it)
        } ?: binding.logo.gone()

        a.getDrawable(R.styleable.NormalItem_normalRightDrawable)?.let {
            binding.right.visible()
            binding.right.setImageDrawable(it)
        } ?: binding.right.gone()

        a.getString(R.styleable.NormalItem_normalTitleText)?.let {
            binding.title.text = it
        }

        a.getColor(R.styleable.NormalItem_normalTitleColor, Color.parseColor("#FF656569")).let {
            binding.title.setTextColor(it)
        }

        a.getDimensionPixelSize(R.styleable.NormalItem_normalTitleTextSize, 13.sp.toInt()).let {
            binding.title.setTextSize(TypedValue.COMPLEX_UNIT_PX, it.toFloat())
        }

        a.getString(R.styleable.NormalItem_normalContentText)?.let {
            binding.content.text = it
        }

        a.getColor(R.styleable.NormalItem_normalContentColor, Color.parseColor("#FF1B1B1C")).let {
            binding.content.setTextColor(it)
        }

        a.getDimensionPixelSize(R.styleable.NormalItem_normalContentTextSize, 13.sp.toInt()).let {
            binding.content.setTextSize(TypedValue.COMPLEX_UNIT_PX, it.toFloat())
        }

        a.getInteger(R.styleable.NormalItem_normalContentTextVisibility, View.VISIBLE).let {
            binding.content.visibility = it
        }

        isSemiBold(binding.title, binding.content)

        a.recycle()
    }

    fun setClickListener(listener: (View) -> Unit) {
        binding.root.setOnClickListener(listener)
    }

    fun setContentListener(listener: (View) -> Unit) {
        binding.content.setOnClickListener(listener)
    }

    fun setRightListener(listener: (View) -> Unit) {
        binding.right.setOnClickListener(listener)
    }

    fun setLeftVisibility(visible: Int) {
        binding.logo.visibility = visible
    }

    fun setRightVisibility(visible: Int) {
        binding.right.visibility = visible
    }

    private fun tintDrawable(drawable: Drawable, colors: ColorStateList): Drawable {
        val wrappedDrawable = DrawableCompat.wrap(drawable.mutate());
        DrawableCompat.setTintList(wrappedDrawable, colors);
        return wrappedDrawable;
    }

    fun setLeftDrawable(@DrawableRes drawableRes: Int, @ColorInt tint: Int) {
        val drawable = ContextCompat.getDrawable(context, drawableRes)
        val colors = ColorStateList.valueOf(tint)
        setLeftDrawable(drawable, colors)
    }

    fun setLeftDrawable(@DrawableRes drawableRes: Int, colors: ColorStateList) {
        val drawable = ContextCompat.getDrawable(context, drawableRes)
        setLeftDrawable(drawable, colors)
    }

    fun setLeftDrawable(drawable: Drawable?, colors: ColorStateList) {
        binding.logo.setImageDrawable(drawable?.let { tintDrawable(it, colors) })
    }

    fun setRightDrawable(@DrawableRes drawableRes: Int, @ColorInt tint: Int) {
        val drawable = ContextCompat.getDrawable(context, drawableRes)
        val colors = ColorStateList.valueOf(tint)
        setRightDrawable(drawable, colors)
    }

    fun setRightDrawable(@DrawableRes drawableRes: Int, colors: ColorStateList) {
        val drawable = ContextCompat.getDrawable(context, drawableRes)
        setRightDrawable(drawable, colors)
    }

    fun setRightDrawable(drawable: Drawable?, colors: ColorStateList) {
        binding.right.setImageDrawable(drawable?.let { tintDrawable(it, colors) })
    }

    fun isTitleSemiBold() {
        binding.title.isSemiBold()
    }

    fun isContentSemiBold() {
        binding.content.isSemiBold()
    }

    fun setTitleText(@StringRes stringRes: Int) {
        binding.title.text = context.getString(stringRes)
    }

    fun setTitleText(text: String) {
        binding.title.text = text
    }

    fun getTitleText(): String {
        return binding.title.string()
    }

    fun setTitleTextColor(@ColorInt color: Int) {
        binding.title.setTextColor(color)
    }

    fun setTitleTextColor(colors: ColorStateList?) {
        if (colors == null) {
            throw NullPointerException("colors must be not null")
        }
        binding.title.setTextColor(colors)
    }

    fun setContentText(@StringRes stringRes: Int) {
        binding.content.text = context.getString(stringRes)
    }

    fun setContentText(text: String) {
        binding.content.text = text
    }

    fun getContentText(): String {
        return binding.content.string()
    }

    fun setContentTextColor(@ColorInt color: Int) {
        binding.content.setTextColor(color)
    }

    fun setContentTextColor(colors: ColorStateList?) {
        if (colors == null) {
            throw NullPointerException("colors must be not null")
        }
        binding.content.setTextColor(colors)
    }

    fun setContentVisibility(visible: Int) {
        binding.content.visibility = visible
    }
}