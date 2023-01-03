package com.polkadot.bt.custom

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import androidx.annotation.Nullable
import androidx.annotation.StringRes
import androidx.constraintlayout.widget.ConstraintLayout
import com.polkadot.bt.R
import com.polkadot.bt.databinding.RadioCheckItemBinding
import com.polkadot.bt.ext.*

/**
 * @author Heaven
 * @date 2022/8/5 10:13
 */
class RadioCheckItem : ConstraintLayout {

    private lateinit var binding: RadioCheckItemBinding

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
        binding = RadioCheckItemBinding.inflate(LayoutInflater.from(context), this)

        val a = context.obtainStyledAttributes(attrs, R.styleable.RadioCheckItem, defStyleAttr, 0)

       /* a.getDrawable(R.styleable.RadioCheckItem_logo)?.let {
            binding.logo.visible()
            binding.logo.imageDrawable = it
        } ?: */binding.logo.gone()

        a.getString(R.styleable.RadioCheckItem_checkText)?.let {
            binding.checkText.text = it
        }

        a.getBoolean(R.styleable.RadioCheckItem_checked, false).let {
            binding.checked.visibleOrGone(it)
        }


        a.recycle()
    }

    fun setClickListener(listener: (View) -> Unit) {
        setOnClickListener(listener)
    }

    fun isSemiBold() {
        binding.checkText.isSemiBold()
    }

    fun setChecked(checked: Boolean) {
        binding.checked.visibleOrGone(checked)
    }

    fun setText(@StringRes stringRes: Int) {
        binding.checkText.text = context.getString(stringRes)
    }

    fun setText(text: String) {
        binding.checkText.text = text
    }

    fun string(): String {
        return binding.checkText.string()
    }
    fun hideBottomLine(){
        binding.bottomLine.gone()
    }
}