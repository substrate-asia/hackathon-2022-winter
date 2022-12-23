package com.polkadot.bt.ui.dapp

import android.content.Context
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.polkadot.bt.R
import com.polkadot.bt.databinding.MoreDialogBinding
import com.polkadot.bt.ext.isSemiBold

/**
 * @author Heaven
 * @date 2022/9/19 10:42
 */
class MoreDialog(
    context: Context,
    private val hasCollect: Boolean,
    private val share: (() -> Unit)? = null,
    private val collection: (() -> Unit)? = null,
    private val refresh: (() -> Unit)? = null,
    private val copy: (() -> Unit)? = null
) : BottomSheetDialog(context, R.style.MBottomSheetDialog) {

    init {
        val binding = MoreDialogBinding.inflate(layoutInflater)

        isSemiBold(binding.share, binding.collection, binding.refresh, binding.copy, binding.cancel)

        binding.iconCollection.setBackgroundResource(if (hasCollect) R.drawable.shape_1b1b1c_corner_5_bg else R.drawable.shape_white_stroke_corner_5_bg)
        binding.collection.setText(if (hasCollect) R.string.uncollect else R.string.collect)

        binding.shareLayout.setOnClickListener {
            dismiss()
            share?.invoke()
        }
        binding.collectionLayout.setOnClickListener {
            dismiss()
            collection?.invoke()
        }
        binding.refreshLayout.setOnClickListener {
            dismiss()
            refresh?.invoke()
        }
        binding.copyLayout.setOnClickListener {
            dismiss()
            copy?.invoke()
        }
        binding.cancel.setOnClickListener {
            dismiss()
        }

        setContentView(binding.root)
        setCancelable(true)
        setCanceledOnTouchOutside(true)
    }
}