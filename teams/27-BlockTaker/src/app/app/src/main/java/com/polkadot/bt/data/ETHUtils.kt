package com.polkadot.bt.data

import bchain.ETHChain
import bchain.entity.ReturnsEntity
import com.polkadot.bt.bean.GasPrice
import com.polkadot.bt.ext.Constants
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.crypto.Credentials
import org.web3j.protocol.Web3j
import utils.GenerateEVM

object ETHUtils {

    private fun initEthUrl(): Web3j {
        return ETHChain.getInstance().initClient(Constants.ETH_URL)
    }


    suspend fun getETHNumber(address: String): String {
        return withContext(Dispatchers.IO) {
            val entity = ETHChain.getInstance().balanceOf(initEthUrl(), address)
            entity.toString()
        }
    }

    suspend fun getETHTokenNumber(userAddress: String, coinAddress: String): String {
        return withContext(Dispatchers.IO) {
            val result = ETHChain.getInstance().getTokenBalance(initEthUrl(), userAddress, coinAddress)
            result.toString()
        }
    }


    suspend fun getETHGasPrice(): GasPrice {
        return withContext(Dispatchers.IO) {
            val map = ETHChain.getInstance().getGasPrice(initEthUrl())
            GasPrice(slow = map["slow"]!!, mid = map["mid"]!!, fast = map["fast"]!!)
        }
    }

    suspend fun sendETH(credentials: Credentials, toAddress: String, amount: String, gas: String, limit: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
                ETHChain.getInstance().sendNativeTransaction(initEthUrl(), credentials, toAddress, amount, gas, limit)
        }
    }

    suspend fun signETH(credentials: Credentials, toAddress: String, amount: String, gasPrice: String, gasLimit: String): String {
        return withContext(Dispatchers.IO) {
            val hexValue = ETHChain.getInstance().createNativeTxSign(initEthUrl(), credentials, toAddress, amount, gasPrice, gasLimit)
            hexValue
        }
    }

    suspend fun sendCallDataByNative(credentials: Credentials, contractAddr: String, amount: String, gas: String, limit: String, callFuncData: String): String {
        return withContext(Dispatchers.IO) {
            ETHChain.getInstance().sendCallDataByNative(initEthUrl(), credentials, contractAddr, amount, gas, limit, callFuncData)
        }
    }

    suspend fun sendCallData(credentials: Credentials, contractAddr: String, gas: String, limit: String, callFuncData: String): String {
        return withContext(Dispatchers.IO) {
            ETHChain.getInstance().sendCallData(initEthUrl(), credentials, contractAddr, gas, limit, callFuncData)
        }
    }

    suspend fun sendETHToken(credentials: Credentials, toAddress: String, coinAddress: String, amount: String, gas: String, limit: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            ETHChain.getInstance().sendTokenTransaction(initEthUrl(), credentials, toAddress, coinAddress, amount, gas, limit)
        }
    }

    suspend fun getCredentialsByPrvKey(privateKey: String): Credentials {
        return withContext(Dispatchers.IO) {
            val credentials = GenerateEVM().getCredentialsByPrvKey(privateKey)
            credentials
        }
    }

    suspend fun getStatus(hash: String): Int {
        return withContext(Dispatchers.IO) {
            ETHChain.getInstance().getTransactionStatus(initEthUrl(), hash)
        }
    }

}