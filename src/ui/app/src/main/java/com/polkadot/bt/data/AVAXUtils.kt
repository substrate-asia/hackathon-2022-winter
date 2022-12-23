package com.polkadot.bt.data

import bchain.AVAXChain
import bchain.ETHChain
import bchain.entity.ReturnsEntity
import com.polkadot.bt.bean.GasPrice
import com.polkadot.bt.ext.Constants
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.crypto.Credentials
import org.web3j.protocol.Web3j

object AVAXUtils {

    private fun initAVAXUrl(): Web3j {
        return AVAXChain.getInstance().initClient(Constants.AVAX_URL)
    }

    suspend fun getAVAXNumber(address: String): String {
        return withContext(Dispatchers.IO) {
            val entity = AVAXChain.getInstance().balanceOf(initAVAXUrl(), address)
            entity.toString()
        }
    }

    suspend fun getAVAXTokenNumber(userAddress: String, coinAddress: String): String {
        return withContext(Dispatchers.IO) {
            val result = AVAXChain.getInstance().getTokenBalance(initAVAXUrl(), userAddress, coinAddress)
            result.toString()
        }
    }

    suspend fun getAVAXGasPrice(): GasPrice {
        return withContext(Dispatchers.IO) {
            val map = AVAXChain.getInstance().getGasPrice(initAVAXUrl())
            GasPrice(slow = map["slow"]!!, mid = map["mid"]!!, fast = map["fast"]!!)
        }
    }

    suspend fun sendAVAX(credentials: Credentials, toAddress: String, amount: String, gas: String, limit: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            val hash =
                AVAXChain.getInstance().sendNativeTransaction(initAVAXUrl(), credentials, toAddress, amount, gas, limit)
            hash
        }
    }

    suspend fun signAVAX(credentials: Credentials, toAddress: String, amount: String, gasPrice: String, gasLimit: String): String {
        return withContext(Dispatchers.IO) {
            val hexValue = ETHChain.getInstance().createNativeTxSign(initAVAXUrl(), credentials, toAddress, amount, gasPrice, gasLimit)
            hexValue
        }
    }

    suspend fun sendCallDataByNative(credentials: Credentials, contractAddr: String, amount: String, gas: String, limit: String, callFuncData: String): String {
        return withContext(Dispatchers.IO) {
            ETHChain.getInstance().sendCallDataByNative(initAVAXUrl(), credentials, contractAddr, amount, gas, limit, callFuncData)
        }
    }

    suspend fun sendCallData(credentials: Credentials, contractAddr: String, gas: String, limit: String, callFuncData: String): String {
        return withContext(Dispatchers.IO) {
            ETHChain.getInstance().sendCallData(initAVAXUrl(), credentials, contractAddr, gas, limit, callFuncData)
        }
    }

    suspend fun sendAVAXToken(credentials: Credentials, toAddress: String, coinAddress: String, amount: String, gas: String, limit: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            AVAXChain.getInstance().sendTokenTransaction(initAVAXUrl(), credentials, toAddress, coinAddress, amount, gas, limit)
        }
    }

    suspend fun getStatus(hash: String): Int {
        return withContext(Dispatchers.IO) {
            AVAXChain.getInstance().getTransactionStatus(initAVAXUrl(), hash)
        }
    }

}