package com.polkadot.bt.data

import bchain.BNBChain
import bchain.ETHChain
import bchain.entity.ReturnsEntity
import com.polkadot.bt.bean.GasPrice
import com.polkadot.bt.ext.Constants
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.crypto.Credentials
import org.web3j.protocol.Web3j

object BNBUtils {

    private fun initBNBUrl(): Web3j {
        return BNBChain.getInstance().initClient(Constants.BNB_URL)
    }

    suspend fun getBNBNumber(address: String): String {
        return withContext(Dispatchers.IO) {
            val entity = BNBChain.getInstance().balanceOf(initBNBUrl(), address)
            entity.toString()
        }
    }

    suspend fun getBNBTokenNumber(userAddress: String, coinAddress: String): String {
        return withContext(Dispatchers.IO) {
            val result = BNBChain.getInstance().getTokenBalance(initBNBUrl(), userAddress, coinAddress)
            result.toString()
        }
    }

    suspend fun getBNBGasPrice(): GasPrice {
        return withContext(Dispatchers.IO) {
            val map = BNBChain.getInstance().getGasPrice(initBNBUrl())
            GasPrice(slow = map["slow"]!!, mid = map["mid"]!!, fast = map["fast"]!!)
        }
    }

    suspend fun sendBNB(credentials: Credentials, toAddress: String, amount: String, gas: String, limit: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            val hash =
                BNBChain.getInstance().sendNativeTransaction(initBNBUrl(), credentials, toAddress, amount, gas, limit)
            hash
        }
    }

    suspend fun signBNB(credentials: Credentials, toAddress: String, amount: String, gasPrice: String, gasLimit: String): String {
        return withContext(Dispatchers.IO) {
            val hexValue = ETHChain.getInstance().createNativeTxSign(initBNBUrl(), credentials, toAddress, amount, gasPrice, gasLimit)
            hexValue
        }
    }

    suspend fun sendCallDataByNative(credentials: Credentials, contractAddr: String, amount: String, gas: String, limit: String, callFuncData: String): String {
        return withContext(Dispatchers.IO) {
            ETHChain.getInstance().sendCallDataByNative(initBNBUrl(), credentials, contractAddr, amount, gas, limit, callFuncData)
        }
    }

    suspend fun sendCallData(credentials: Credentials, contractAddr: String, gas: String, limit: String, callFuncData: String): String {
        return withContext(Dispatchers.IO) {
            ETHChain.getInstance().sendCallData(initBNBUrl(), credentials, contractAddr, gas, limit, callFuncData)
        }
    }

    suspend fun sendBNBToken(credentials: Credentials, toAddress: String, coinAddress: String, amount: String, gas: String, limit: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            BNBChain.getInstance().sendTokenTransaction(initBNBUrl(), credentials, toAddress, coinAddress, amount, gas, limit)
        }
    }

    suspend fun getStatus(hash: String): Int {
        return withContext(Dispatchers.IO) {
            BNBChain.getInstance().getTransactionStatus(initBNBUrl(), hash)
        }
    }

}