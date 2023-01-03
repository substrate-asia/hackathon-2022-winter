package com.polkadot.bt.ui.dapp

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import com.bumptech.glide.Glide
import com.bumptech.glide.request.RequestOptions
import com.trustwallet.walletconnect.models.ethereum.WCEthereumSignMessage
import com.polkadot.bt.R
import com.polkadot.bt.databinding.ActivityWalletConnectEthSignBinding
import com.polkadot.bt.ext.click
import com.polkadot.bt.module.wallet_connect.WCController
import com.polkadot.bt.module.wallet_connect.WCController.decodeHex
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.BaseActivity
import org.web3j.crypto.Credentials
import org.web3j.crypto.Sign
import org.web3j.utils.Numeric
import wallet.core.jni.CoinType
import wallet.core.jni.PrivateKey

/**
 * Create:NoahZhao
 * Date:2022/9/25 11:07
 * Description:WalletConnectEthSignActivity
 */
class WalletConnectEthSignActivity : BaseActivity<ActivityWalletConnectEthSignBinding>() {
    var linkEntityNew: LinkEntityNew? = null

    override fun initBinding(): ActivityWalletConnectEthSignBinding = ActivityWalletConnectEthSignBinding.inflate(layoutInflater)

    companion object {
        var sHandshakeId: Long? = null
        var sWCEthereumSignMessage: WCEthereumSignMessage? = null
        fun start(context: Context, linkEntityNew: LinkEntityNew, handshakeId: Long, wcEthereumSignMessage: WCEthereumSignMessage) {
            sHandshakeId = handshakeId
            sWCEthereumSignMessage = wcEthereumSignMessage
            context.startActivity(
                Intent(context, WalletConnectEthSignActivity::class.java)
                    .putExtra("link", linkEntityNew)
            )
        }
    }

    @SuppressLint("SetTextI18n")
    override fun init() {
        linkEntityNew = intent?.getSerializableExtra("link") as LinkEntityNew

        Glide.with(this)
            .load(WCController.lastPeer!!.icons[0])
            .apply(RequestOptions().circleCrop().placeholder(R.drawable.shape_d8d8d8_circle_bg))
            .into(binding.ivIcon)
        binding.tvName.text = "${WCController.lastPeer!!.name}"

        binding.tvContent.text = sWCEthereumSignMessage!!.data

        click(binding.btnSubmit) {
            val privateKey = PrivateKey(String(WCController.linkEntityNew!!.privateKey).decodeHex())
            val signed = privateKey.sign(
                if (sWCEthereumSignMessage!!.type == WCEthereumSignMessage.WCSignType.TYPED_MESSAGE)
                    sWCEthereumSignMessage!!.data.toByteArray()
                else
                    sWCEthereumSignMessage!!.data.decodeHex(),
                CoinType.ETHEREUM.curve()
            )
            val personalSigned = signMessage(sWCEthereumSignMessage!!.data, String(WCController.linkEntityNew!!.privateKey))
            WCController.wcClient.approveRequest(sHandshakeId!!,
                if (sWCEthereumSignMessage!!.type == WCEthereumSignMessage.WCSignType.PERSONAL_MESSAGE)
                    personalSigned
                else
                    WCController.bytesToHex(signed)
            )
            finish()
        }
        click(binding.btnReject) {
            WCController.wcClient.rejectRequest(sHandshakeId!!)
            finish()
        }
    }

    private fun signMessage(message: String, privateKey: String): String {
        val messageBytes = if (message.isHexStrict) {
            Numeric.hexStringToByteArray(message)
        } else {
            message.toByteArray()
        }

        val credentials = Credentials.create(privateKey)
        val data = Sign.signPrefixedMessage(messageBytes, credentials.ecKeyPair,)
        return Numeric.toHexString(data.signature)
    }

    private val String.isHexStrict: Boolean
        get() = matches("^(0x)?([0-9a-fA-F]{2})+$".toRegex())

    private val Sign.SignatureData.signature: ByteArray
        get() {
            val magic1 = byteArrayOf(0, 27, 31, 35)
            val magic2 = byteArrayOf(1, 28, 32, 36)
            val v = v.firstOrNull() ?: throw Error("v is empty")
            return r + s + when {
                magic1.contains(v) -> {
                    0x1b
                }
                magic2.contains(v) -> {
                    0x1c
                }
                else -> {
                    throw Error("invalid v")
                }
            }
        }

    override fun onDestroy() {
        sHandshakeId = null
        sWCEthereumSignMessage = null
        super.onDestroy()
    }
}