package com.polkadot.bt.data

import bchain.MATICChain
import bchain.entity.ReturnsEntity
import com.polkadot.bt.bean.GasPrice
import com.polkadot.bt.ext.Constants
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.crypto.Credentials
import org.web3j.protocol.Web3j

object MATICUtils {

    private fun initMATICUrl(): Web3j {
        return MATICChain.getInstance().initClient(Constants.MATIC_URL)
    }


    suspend fun getMATICNumber( address:String):String{
        return  withContext(Dispatchers.IO){
            val entity= MATICChain.getInstance().balanceOf(initMATICUrl(),address)
            entity.toString()
        }
    }

    suspend fun getMATICTokenNumber(userAddress:String,coinAddress:String):String{
        return withContext(Dispatchers.IO){
            val result=MATICChain.getInstance().getTokenBalance(initMATICUrl(),userAddress,coinAddress)
            result.toString()
        }
    }
    suspend fun getMATICGasPrice(): GasPrice {
        return  withContext(Dispatchers.IO){
            val map= MATICChain.getInstance().getGasPrice(initMATICUrl())
            GasPrice(slow = map["slow"]!!, mid = map["mid"]!!, fast = map["fast"]!!)
        }
    }

    suspend fun sendMATIC( credentials : Credentials, toAddress:  String, amount : String,gas:String,limit:String): ReturnsEntity {
        return withContext(Dispatchers.IO){
              MATICChain.getInstance().sendNativeTransaction(initMATICUrl(),credentials,toAddress,amount,gas,limit)
        }
    }

    suspend fun sendMATICToken( credentials : Credentials, toAddress:  String,coinAddress: String, amount : String,gas:String,limit:String):ReturnsEntity{
        return withContext(Dispatchers.IO){
            MATICChain.getInstance().sendTokenTransaction(initMATICUrl(),credentials,toAddress,coinAddress,amount,gas,limit)
        }
    }

    suspend fun getStatus(hash:String):Int{
        return withContext(Dispatchers.IO){
            MATICChain.getInstance().getTransactionStatus(initMATICUrl(),hash)
        }
    }
}