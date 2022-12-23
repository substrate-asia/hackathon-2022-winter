package com.polkadot.bt.dialog

import android.content.Context
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.polkadot.bt.R
import com.polkadot.bt.databinding.WebDialogBinding
import com.polkadot.bt.ext.isSemiBold

class WebDialog(
    context: Context,
    private val share: (() -> Unit)? = null,
    private val refresh: (() -> Unit)? = null,
    private val copy: (() -> Unit)? = null
) : BottomSheetDialog(context, R.style.MBottomSheetDialog) {

    init {
        val binding = WebDialogBinding.inflate(layoutInflater)

        isSemiBold(binding.share, binding.refresh, binding.copy, binding.cancel)


        binding.shareLayout.setOnClickListener {
            dismiss()
            share?.invoke()
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