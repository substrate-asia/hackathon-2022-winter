package com.polkadot.bt.ui.channel

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.text.*
import android.text.style.ForegroundColorSpan
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.polkadot.bt.R
import com.polkadot.bt.bean.getMainLinks
import com.polkadot.bt.databinding.FragmentImportBinding
import com.polkadot.bt.ext.*
import com.polkadot.bt.ui.BaseVBFragment
import com.polkadot.bt.ui.channel.ImportActivity.Companion.MNEMONIC
import com.polkadot.bt.ui.channel.adapter.MnemonicAdapter
import com.polkadot.bt.ui.channel.adapter.OnItemClick
import com.polkadot.bt.ui.channel.adapter.WalletAdapter
import com.polkadot.bt.ui.create.CreateWalletActivity
import splitties.views.backgroundColor


class ImportFragment: BaseVBFragment<FragmentImportBinding>() {
    private var adapter: WalletAdapter? = null
    private var mnemonicAdapter: MnemonicAdapter? = null
    private var mPosition = 0
    private var mnemonics: ArrayList<String> = arrayListOf()
    private var lastContent = ""
    private var selectionPosition = 0
    private var lastEmptyPosition = 0
    private val wordList = mutableListOf<String>()
    private var editFlag = true

    companion object {
        const val TYPE = "type"
        fun getInstance(type: String): ImportFragment {
            return ImportFragment().apply {
                arguments = Bundle().apply {
                    putString(TYPE, type)
                }
            }
        }

        fun getType(fragment: ImportFragment): String {
            return fragment.arguments?.getString(TYPE) ?: ""
        }
    }
    override fun initBinding(container: ViewGroup?): FragmentImportBinding {
        return FragmentImportBinding.inflate(layoutInflater)
    }

    override fun init() {
        KeyboardUtil(activity).observeInputlayout(binding.parent, object : KeyboardUtil.OnInputActionListener {
            override fun onOpen() {
                binding.tvImport.gone()
                if (binding.etInfo.text.length == selectionPosition)
                    binding.rvMnemonic.visible()
                binding.etInfo.setSelection(selectionPosition)
            }

            override fun onClose() {
                binding.tvImport.postDelayed({ binding.tvImport.visible() }, 50)
                binding.rvMnemonic.gone()
                binding.etInfo.clearFocus()
            }
        })
        mnemonics.addAll(resources.getStringArray(R.array.mnemonics))
        val layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.layoutManager = layoutManager
        adapter = WalletAdapter(requireContext(), object : OnItemClick{
            @SuppressLint("StringFormatInvalid")
            override fun click(position: Int) {
                binding.tvTips.backgroundColor = Color.WHITE
                binding.tvTips.text = getString(R.string.key_import_desc2, adapter!!.getData()[position].name)
                binding.recyclerView.gone()
                mPosition = position
            }
        })
        binding.recyclerView.adapter = adapter
        if (getType(this) == MNEMONIC) {
            binding.recyclerView.gone()
        } else {
            binding.tvTips.text = getString(R.string.key_import_desc1)
            binding.tvTips.backgroundColor = resources.getColor(R.color.background)
        }

        val mnemonicLayoutManager = LinearLayoutManager(requireContext(), RecyclerView.HORIZONTAL, false)
        binding.rvMnemonic.layoutManager = mnemonicLayoutManager
        mnemonicAdapter = MnemonicAdapter(requireContext(), object : OnItemClick{
            override fun click(position: Int) {
                editFlag = false
                val word = mnemonicAdapter!!.getData()[position]

                binding.etInfo.text.delete(if (lastEmptyPosition == 0) 0 else lastEmptyPosition + 1, selectionPosition)

                if (binding.etInfo.text.isEmpty())
                    binding.etInfo.text.append("$word ")
                else if (wordList.size < 13)
                    binding.etInfo.text.insert(if (lastEmptyPosition == 0) 0 else lastEmptyPosition +1, "$word ")

                val content = binding.etInfo.text.toString()
                //助记词去空格
                wordList.clear()
                wordList.addAll(content.split(" ").toMutableList())
                val list = wordList.iterator()
                while (list.hasNext()) {
                    val mnemonic = list.next()
                    if (TextUtils.isEmpty(mnemonic))
                        list.remove()
                }
                lastContent = content
                selectionPosition = content.length

                binding.rvMnemonic.gone()
                mnemonicAdapter?.getData()?.clear()
                mnemonicAdapter?.notifyDataSetChanged()
                editFlag = true

                //判断输入当前助记词是否错误
                if (binding.error.isVisible)binding.error.gone()
                wordList.forEach {
                    if (!mnemonics.contains(it)){
                        binding.error.visible()
                        return
                    }
                }
            }
        })
        binding.rvMnemonic.adapter = mnemonicAdapter
        initData()
        initListeners()
    }

    private fun initData() {
        adapter?.setData(getMainLinks())
    }

    private fun initListeners() {
        binding.etInfo.addTextChangedListener(object : TextWatcher{
            override fun beforeTextChanged(p0: CharSequence, p1: Int, p2: Int, p3: Int) {}

            override fun onTextChanged(p0: CharSequence, p1: Int, p2: Int, p3: Int) {
                if (getType(this@ImportFragment) == MNEMONIC) {
                    if (editFlag) {
                        val content = binding.etInfo.text.toString()
                        if (content.length == 1 && content == " ") {
                            binding.etInfo.setText("")
                            return
                        }

                        //助记词去空格
                        wordList.clear()
                        wordList.addAll(content.split(" ").toMutableList())
                        val list = wordList.iterator()
                        while (list.hasNext()) {
                            val mnemonic = list.next()
                            if (TextUtils.isEmpty(mnemonic))
                                list.remove()
                        }
                        Log.e("wordList", wordList.toString())

                        lastContent = content
                        if (binding.etInfo.selectionStart != 0)
                            selectionPosition = binding.etInfo.selectionStart
                        lastEmptyPosition = content.lastIndexOf(" ")
                        if (lastEmptyPosition == -1) lastEmptyPosition = 0

                        //当有12个助记词时
                        if (wordList.size > 12) {
                            binding.rvMnemonic.gone()
                            binding.etInfo.text.delete(selectionPosition - 1, binding.etInfo.selectionStart)
                            return
                        }

                        if (content.isEmpty()) {
                            selectionPosition = 0
                        }

                        if (content.length == selectionPosition) {
                            val data = arrayListOf<String>()
                            val start = p0.substring(if (lastEmptyPosition == 0) 0 else lastEmptyPosition +1, selectionPosition)
                            mnemonics.forEach {
                                if (!TextUtils.isEmpty(p0.toString()) && !TextUtils.isEmpty(start) && it.startsWith(start))
                                    data.add(it)
                            }
                            mnemonicAdapter?.setData(data)
                            binding.rvMnemonic.visibility = if (!data.contains(p0.toString())) View.VISIBLE else View.GONE
                        } else {
                            binding.rvMnemonic.gone()
                        }
                        /*if (data.isEmpty() && start.isNotBlank() && editFlag && content.length == selectionPosition) {
                            toast(R.string.mnemonics_wrong, Gravity.CENTER)
                            binding.tvImport.isEnabled = false
                            return
                        }*/
                        binding.tvImport.isEnabled = wordList.size == 12
                        //判断输入当前助记词是否错误
                        if (binding.error.isVisible)binding.error.gone()
                        wordList.forEach {
                            if (!mnemonics.contains(it)){
                                    binding.error.visible()
                                    return
                                }
                            }
                    }
                } else {
                    binding.tvImport.isEnabled = p0.isNotEmpty()
                }
            }

            override fun afterTextChanged(p0: Editable?) {}
        })
        binding.tvImport.clickNoRepeat {
            if (getType(this)==MNEMONIC){
                var isWrong = false
                //文本内容
                val ss = SpannableString(lastContent)
                wordList.forEach {
                    if (!mnemonics.contains(it)) {
                        isWrong = true
                        val index = ss.indexOf(it)
                        //设置字符颜色
                        ss.setSpan(
                            ForegroundColorSpan(Color.RED),
                            index,
                            index + it.length,
                            Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                        )
                    }
                }
                if (isWrong) {
                    binding.etInfo.setText(ss)
                    toast(R.string.mnemonics_wrong, Gravity.CENTER)
                    return@clickNoRepeat
                }
            }else{
                //判断私钥长度
                val keySize=binding.etInfo.string().trim().length
                if (adapter!!.getData()[mPosition].name=="BTC"){
                    if (keySize!=52){
                        toast(R.string.key_wrong, Gravity.CENTER)
                        return@clickNoRepeat
                    }
                }else if(binding.etInfo.string().trim().startsWith("0x")&&keySize!=66){
                    toast(R.string.key_wrong, Gravity.CENTER)
                    return@clickNoRepeat

                } else if (!binding.etInfo.string().trim().startsWith("0x")&&keySize!=64){
                    toast(R.string.key_wrong, Gravity.CENTER)
                    return@clickNoRepeat
                }
            }

            startActivity(Intent(requireContext(), CreateWalletActivity::class.java)
                .putExtra("from", getType(this))
                .putExtra("isFromMetaSpace", (activity as ImportActivity).isFromMetaSpace)
                .putExtra("info", binding.etInfo.string())
                .putExtra("type", adapter!!.getData()[mPosition].name)
                .putExtra("icon", adapter!!.getData()[mPosition].icon)
            )
        }
    }
}