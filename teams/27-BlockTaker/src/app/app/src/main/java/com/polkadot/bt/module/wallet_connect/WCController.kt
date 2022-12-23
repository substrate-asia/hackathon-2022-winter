package com.polkadot.bt.module.wallet_connect

import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.google.gson.GsonBuilder
import com.trustwallet.walletconnect.WCClient
import com.trustwallet.walletconnect.models.WCPeerMeta
import com.trustwallet.walletconnect.models.WCSignTransaction
import com.trustwallet.walletconnect.models.binance.WCBinanceCancelOrder
import com.trustwallet.walletconnect.models.binance.WCBinanceTradeOrder
import com.trustwallet.walletconnect.models.binance.WCBinanceTransferOrder
import com.trustwallet.walletconnect.models.binance.WCBinanceTxConfirmParam
import com.trustwallet.walletconnect.models.ethereum.WCEthereumSignMessage
import com.trustwallet.walletconnect.models.ethereum.WCEthereumTransaction
import com.trustwallet.walletconnect.models.session.WCAddNetwork
import com.trustwallet.walletconnect.models.session.WCSession
import com.polkadot.bt.App
import com.polkadot.bt.R
import com.polkadot.bt.dialog.WaitDialog
import com.polkadot.bt.ext.ActivityManager
import com.polkadot.bt.room.entities.LinkEntityNew
import com.polkadot.bt.ui.dapp.WalletConnectEthSignActivity
import com.polkadot.bt.ui.dapp.WalletConnectSessionActivity
import com.polkadot.bt.ui.dapp.WalletConnectTransactionActivity
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import splitties.activities.start


/**
 * Create:NoahZhao
 * Date:2022/9/22 14:05
 * Description:WcController
 */
object WCController {
    private const val TAG = "WCController"
    var linkEntityNew: LinkEntityNew? = null
    var lastPeer: WCPeerMeta? = null
    private val mHandler = Handler()
    private var reConnect = false
    var connectType = 0 //0为扫码 1为其他连接
    private var wcUri = ""
    private val connectTimeout = Runnable {
        timeout?.timeout()
    }
    private var timeout: TimeoutCallback? = null

    init {
        System.loadLibrary("TrustWalletCore")
    }

    open class WCListener {
        open fun onFailure(throwable: Throwable): Unit = Unit
        open fun onDisconnect(code: Int, reason: String): Unit = Unit
        open fun onSessionRequest(id: Long, peer: WCPeerMeta): Unit = Unit
        open fun onEthSign(id: Long, message: WCEthereumSignMessage): Unit = Unit
        open fun onEthSignTransaction(id: Long, transaction: WCEthereumTransaction): Unit = Unit
        open fun onEthSendTransaction(id: Long, transaction: WCEthereumTransaction): Unit = Unit
        open fun onCustomRequest(id: Long, payload: String): Unit = Unit
        open fun onBnbTrade(id: Long, order: WCBinanceTradeOrder): Unit = Unit
        open fun onBnbCancel(id: Long, order: WCBinanceCancelOrder): Unit = Unit
        open fun onBnbTransfer(id: Long, order: WCBinanceTransferOrder): Unit = Unit
        open fun onBnbTxConfirm(id: Long, order: WCBinanceTxConfirmParam): Unit = Unit
        open fun onGetAccounts(id: Long): Unit = Unit
        open fun onSignTransaction(id: Long, transaction: WCSignTransaction): Unit = Unit
        open fun onWalletChangeNetwork(id: Long, chainId: Int): Unit = Unit
        open fun onWalletAddNetwork(id: Long, network: WCAddNetwork): Unit = Unit
    }

    val listenerList: MutableList<WCListener> = mutableListOf()
    var isSessionApproved: Boolean = false
    val wcClient by lazy {
        //初始化示例以及回调
        WCClient(GsonBuilder(), OkHttpClient()).apply {
            this.onSessionRequest = { _id, peer ->
                // ask for user consent
                Log.d(TAG, "onSessionRequest")
                mHandler.removeCallbacks(connectTimeout)
                WaitDialog.dismiss()
                lastPeer = peer
                ActivityManager.getCurrentActivity()?.start<WalletConnectSessionActivity> { /*NOTHING TO DO*/ }
                Handler(Looper.getMainLooper()).post {
                    listenerList.forEach { it.onSessionRequest(_id, peer) }
                    //加入浮窗到主界面
//                    if (connectType == 0)
                        addFloatingWindowIfNeed()
                }
            }
            this.onDisconnect = { _code, _reason ->
                // handle disconnect
                Log.d(TAG, "onDisconnect")
                linkEntityNew = null
                isSessionApproved = false
                Handler(Looper.getMainLooper()).post {
                    listenerList.forEach { it.onDisconnect(_code, _reason) }
                    //关闭浮窗到主界面
                    removeFloatingWindow()
                }
                if (reConnect) {
                    MainScope().launch {
                        mHandler.removeCallbacks(connectTimeout)
                        WaitDialog.dismiss()
                        connect(wcUri, connectType, timeout!!)
                    }
                }
            }
            this.onFailure = { t ->
                // handle failure
                Log.d(TAG, "onFailure")
                mHandler.removeCallbacks(connectTimeout)
                WaitDialog.dismiss()
                isSessionApproved = false
                Handler(Looper.getMainLooper()).post {
                    listenerList.forEach { it.onFailure(t) }
                    //关闭浮窗到主界面
                    removeFloatingWindow()
                }
            }
            this.onGetAccounts = { id ->
                // handle get_accounts
                Log.d(TAG, "onGetAccounts")
            }
            this.onEthSign = { id, message ->
                // handle eth_sign, personal_sign, eth_signTypedData
                Log.d(TAG, "onEthSign")
                ActivityManager.getMainActivity()?.let { mainActivity ->
                    WalletConnectEthSignActivity.start(mainActivity, linkEntityNew!!, id, message)
                }
            }
            this.onEthSignTransaction = { id, transaction ->
                // handle eth_signTransaction
                Log.d(TAG, "onEthSignTransaction")
                ActivityManager.getMainActivity()?.let { mainActivity ->
                    WalletConnectTransactionActivity.start(mainActivity, linkEntityNew!!, id, transaction, true)
                }
            }
            this.onEthSendTransaction = { id, transaction ->
                // handle eth_sendTransaction
                Log.d(TAG, "onEthSendTransaction")
                ActivityManager.getMainActivity()?.let { mainActivity ->
                    WalletConnectTransactionActivity.start(mainActivity, linkEntityNew!!, id, transaction, false)
                }
            }
            this.onCustomRequest = { id: Long, payload: String ->
                Log.d(TAG, "onCustomRequest")
            }
            this.onBnbTrade = { id: Long, order: WCBinanceTradeOrder ->
                Log.d(TAG, "onBnbTrade")
            }
            this.onBnbCancel = { id: Long, order: WCBinanceCancelOrder ->
                Log.d(TAG, "onBnbCancel")
            }
            this.onBnbTransfer = { id: Long, order: WCBinanceTransferOrder ->
                Log.d(TAG, "onBnbTransfer")
            }
            this.onBnbTxConfirm = { id: Long, order: WCBinanceTxConfirmParam ->
                Log.d(TAG, "onBnbTxConfirm")
            }
            this.onGetAccounts = { id: Long ->
                Log.d(TAG, "onGetAccounts")
            }
            this.onSignTransaction = { id: Long, transaction: WCSignTransaction ->
                // handle bnb_sign
                Log.d(TAG, "onSignTransaction")
            }
            this.onWalletChangeNetwork = { id: Long, chainId: Int ->
                Log.d(TAG, "onWalletChangeNetwork")
            }
            this.onWalletAddNetwork = { id: Long, network: WCAddNetwork ->
                Log.d(TAG, "onWalletAddNetwork")
            }
        }

    }

    fun connect(wcUri: String, connectType: Int, timeoutCallback: TimeoutCallback) {
        this.timeout = timeoutCallback
        this.wcUri = wcUri
        this.connectType = connectType
        reConnect = wcClient.isConnected
        if (reConnect) {
            wcClient.disconnect()
        } else {
            mHandler.postDelayed(connectTimeout, 30000)
            WaitDialog.showRound()
            val peerMeta = WCPeerMeta(name = App.context.resources.getString(R.string.app_name), url = "https://www.vertu.com")
            val wcSession = WCSession.from(wcUri) ?: throw RuntimeException() // invalid session
            // handle session
            wcClient.connect(wcSession, peerMeta)
        }

    }

    fun disConnect(){
        wcClient.disconnect()
    }

    fun approveSession(accounts: List<String>, chainId: Int, linkEntityNew: LinkEntityNew): Boolean {
        this.linkEntityNew = linkEntityNew
        isSessionApproved = true
        return wcClient.approveSession(accounts, chainId)
    }

    fun addFloatingWindowIfNeed() {
        if (!wcClient.isConnected)
            return
        ActivityManager.getMainActivity()?.let { mainActivity ->
            val rootView: View = mainActivity.getWindow().decorView.findViewById<ViewGroup?>(android.R.id.content).getChildAt(0).findViewById(R.id.fl_floating_window_container)
            assert(rootView is FrameLayout)
            (rootView as FrameLayout).removeAllViews()
            val floatingView = WalletConnectFloatingView(mainActivity)
            (rootView as FrameLayout).addView(floatingView)
            floatingView.setOnClickListener {
                mainActivity.start<WalletConnectSessionActivity> { /*NOTHING TO DO*/ }
            }
            floatingView.initLocation()
        }
    }

    fun removeFloatingWindow() {
        ActivityManager.getMainActivity()?.let { mainActivity ->
            val rootView: View = mainActivity.window.decorView.findViewById<ViewGroup?>(android.R.id.content).getChildAt(0).findViewById(R.id.fl_floating_window_container)
            assert(rootView is FrameLayout)
            (rootView as FrameLayout).removeAllViews()
        }
    }

    fun String.decodeHex(): ByteArray {
        check(length % 2 == 0) { "Must have an even length" }

        return removePrefix("0x")
            .chunked(2)
            .map { it.toInt(16).toByte() }
            .toByteArray()
    }

    fun bytesToHex(bytes: ByteArray): String {
        val sb = StringBuffer("0x")
        for (b in bytes) {
            val st = String.format("%02X", b)
            sb.append(st.lowercase())
        }
        return sb.toString()
    }
}

interface TimeoutCallback{
    fun timeout()
}