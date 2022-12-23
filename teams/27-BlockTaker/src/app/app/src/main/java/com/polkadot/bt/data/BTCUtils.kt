package com.polkadot.bt.data

import bchain.BTCChain
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.bean.GasPrice
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.bitcoinj.core.NetworkParameters
import wf.bitcoin.javabitcoindrpcclient.BitcoinJSONRPCClient

object BTCUtils {

    fun initParam(): NetworkParameters {
        return BTCChain.getInstance().initParam(BuildConfig.BTC_SERVICE_TYPE)
    }

    private fun initUrl(): BitcoinJSONRPCClient {
        /*正式*/
        //http://8.210.98.220:8333
        //rpcuser=vertu2022
        //rpcpassword=omnivertu2022
        return BTCChain.getInstance().initUrl(BuildConfig.BTC_URL)
    }

     fun isBtcAddress(address: String):Boolean{
        return BTCChain.getInstance().valid(initParam(),address)
    }

    suspend fun getBtcNumber(adress:String): String {
        return withContext(Dispatchers.IO){
            val btnNumber= BTCChain.getInstance().getBTCBalance(initUrl(),adress)
            btnNumber
        }
    }
    suspend fun getBtcTokenNumber(adress:String): String {
        return withContext(Dispatchers.IO){
            val usdtId=if (BuildConfig.FLAVOR=="stageEnv") 1 else 31
            val btnNumber= BTCChain.getInstance().getUsdtBalance(initUrl(),adress,usdtId)
            btnNumber
        }
    }

    suspend fun sendBtc(key: String,
         address:String,amount:String,fee:String):String{
        return withContext(Dispatchers.IO){
            val result= BTCChain.getInstance().sendNativeTransaction(initParam(), initUrl(),key,address,amount,fee)
            result.ifEmpty { "" }
        }
    }
    suspend fun sendBtcToken(key: String,
         address:String,amount:String,fee:String):String{
        return withContext(Dispatchers.IO){
          val usdtId=if (BuildConfig.FLAVOR=="stageEnv") 1 else 31
            val result= BTCChain.getInstance().sendTokenTransaction(initParam(), initUrl(),key,address,amount,fee,usdtId)
            result.ifEmpty { "" }
        }
    }


    suspend fun getBTCGasFee(): GasPrice {
        return  withContext(Dispatchers.IO){
            val map= BTCChain.getInstance().getSinglePrice("")
            GasPrice(slow = map["slow"]!!, mid = map["mid"]!!, fast = map["fast"]!!)
        }
    }
    suspend fun getBTCGasInfo(address:String,fee:String,amount:String) :String{
        return  withContext(Dispatchers.IO){
            val map= BTCChain.getInstance().getBTCGasInfo(initUrl(),address,fee,amount)
           map
        }
    }
    suspend fun getBTCTokenGasInfo(address:String,fee:String) :String{
        return  withContext(Dispatchers.IO){
            val map= BTCChain.getInstance().getUSDTGasInfo(initUrl(),address,fee)
           map
        }
    }
    suspend fun getStatus(hash:String):Int{
        return withContext(Dispatchers.IO){
            BTCChain.getInstance().getTransactionStatus(initUrl(),hash)
        }
    }

}