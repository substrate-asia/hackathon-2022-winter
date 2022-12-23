package com.polkadot.bt.data

import bchain.HTChain
import bchain.entity.ReturnsEntity
import com.polkadot.bt.bean.GasPrice
import com.polkadot.bt.ext.Constants
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.web3j.crypto.Credentials
import org.web3j.protocol.Web3j

object HTUtils {

    private fun initHTUrl(): Web3j {
        return HTChain.getInstance().initClient(Constants.HT_URL)
    }


    suspend fun getHTNumber( address:String):String{
        return  withContext(Dispatchers.IO){
            val entity= HTChain.getInstance().balanceOf(initHTUrl(),address)
            entity.toString()
        }
    }

    suspend fun getHTTokenNumber(userAddress:String,coinAddress:String):String{
        return withContext(Dispatchers.IO){
            val result=HTChain.getInstance().getTokenBalance(initHTUrl(),userAddress,coinAddress)
            result.toString()
        }
    }

    suspend fun getHTGasPrice(): GasPrice {
        return  withContext(Dispatchers.IO){
            val map= HTChain.getInstance().getGasPrice(initHTUrl())
            GasPrice(slow = map["slow"]!!, mid = map["mid"]!!, fast = map["fast"]!!)
        }
    }

    suspend fun sendHT( credentials : Credentials, toAddress:  String, amount : String,gas:String,limit:String): ReturnsEntity {
        return withContext(Dispatchers.IO){
              HTChain.getInstance().sendNativeTransaction(initHTUrl(),credentials,toAddress,amount,gas,limit)
        }
    }
    suspend fun sendHTToken( credentials : Credentials, toAddress:  String,coinAddress: String, amount : String,gas:String,limit:String):ReturnsEntity{
        return withContext(Dispatchers.IO){
            HTChain.getInstance().sendTokenTransaction(initHTUrl(),credentials,toAddress,coinAddress,amount,gas,limit)
        }
    }
    suspend fun getStatus(hash:String):Int{
        return withContext(Dispatchers.IO){
            HTChain.getInstance().getTransactionStatus(initHTUrl(),hash)
        }
    }
}