package com.polkadot.bt.data

import bchain.entity.GenerateEntity
import bchain.entity.ReturnsEntity
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.ext.Constants
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.DecimalFormat

/**
 * Create:NoahZhao
 * Date:2022/12/12 13:28
 * Description:DOTUtils
 */
object DOTUtils {

    private fun getDOTUrl(): String {
        return Constants.DOT_URL
    }

    private fun isTest(): Boolean {
        if (BuildConfig.FLAVOR != "releaseEnv" && BuildConfig.FLAVOR != "stageEnv")
            throw java.lang.RuntimeException("修改了FLAVOR后请适配")
        return BuildConfig.FLAVOR == "stageEnv"
    }

    fun getDecimals(): Int {
        return if (isTest()) 12 else 10
    }

    fun newAccountWithMnemonic(mnemonic: String): GenerateEntity {
        val entity = GenerateEntity()
        val generateArray = DOTApiLibrary.INSTANCE.newAccountWithMnemonic(mnemonic, Constants.DOT_NETWORK).split(":")
        entity.address = generateArray[0]
        entity.privateKey = generateArray[2]
        return entity
    }

    fun accountWithPrivKey(privateKey: String): GenerateEntity {
        val entity = GenerateEntity()
        val generateArray = DOTApiLibrary.INSTANCE.accountWithPrivKey(privateKey, Constants.DOT_NETWORK).split(":")
        entity.address = generateArray[0]
        entity.privateKey = generateArray[2]
        entity.mnemonics = ""
        entity.fileName = ""
        return entity
    }

    suspend fun getDOTNumber(address: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val balance = DOTApiLibrary.INSTANCE.getBalance(getDOTUrl(), "", address)
                val balanceArray = balance.split(":")
                val balance1 = StringBuffer()
                balanceArray.forEach {
                    val conversion = if (isTest()) 1000000000000 else 10000000000
                    val pattern = if (isTest()) "0.############" else "0.##########"
                    balance1.append(DecimalFormat(pattern).format(it.toDouble() / conversion) + ":")
                }
                balance1.toString().substring(0, balance1.length - 1)
            } catch (e: Exception) {
                "0:0"
            }
        }
    }

    /**
     * 总量：绑定的：锁定的：解绑中的
     * 锁定的 = 绑定的 + 解绑中的
     */
    suspend fun getAccountStatus(address: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val balance = DOTApiLibrary.INSTANCE.getAccountStatus(getDOTUrl(), BuildConfig.DOT_SCAN_URL, address, BuildConfig.DOT_SCAN_API_KEY)
                val balanceArray = balance.split(":")
                val conversion = if (isTest()) 1000000000000 else 10000000000
                val pattern = if (isTest()) "0.############" else "0.##########"
                "${balanceArray[0]}:" +
                        "${DecimalFormat(pattern).format(balanceArray[1].toDouble() / conversion)}:" +
                        "${balanceArray[2]}:" +
                        "${DecimalFormat(pattern).format(balanceArray[3].toDouble() / conversion)}"
            } catch (e: Exception) {
                "0:0:0:0"
            }
        }
    }

    suspend fun fetchTransactionDetail(txhash: String): String {
        return withContext(Dispatchers.IO) {
            DOTApiLibrary.INSTANCE.fetchTransactionDetail(getDOTUrl(), "https://polkadot.subscan.io", txhash)
        }
    }

    suspend fun estimateFeesForTransaction(privkey: String, fromAddress: String, toAddress: String, amount: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val conversion = if (isTest()) 1000000000000 else 10000000000
                val conversionAmount = DecimalFormat("0").format(amount.toDouble() * conversion)
                val generateTransferTx = DOTApiLibrary.INSTANCE.generateTransferTx(getDOTUrl(), "", fromAddress, toAddress, conversionAmount, privkey)
                val fees = DOTApiLibrary.INSTANCE.estimateFeesForTransaction(getDOTUrl(), "", generateTransferTx)
                DecimalFormat("0.########").format(fees.toDouble() / conversion)
            } catch (e: Exception) {
                "0"
            }
        }
    }

    suspend fun sendDOT(privkey: String, fromAddress: String, toAddress: String, amount: String, gas: String, limit: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            val conversion = if (isTest()) 1000000000000 else 10000000000
            val conversionAmount = DecimalFormat("0").format(amount.toDouble() * conversion)
            val generateTransferTx = DOTApiLibrary.INSTANCE.generateTransferTx(getDOTUrl(), "", fromAddress, toAddress, conversionAmount, privkey)
            val sendRawTransaction = DOTApiLibrary.INSTANCE.sendRawTransaction(getDOTUrl(), "", generateTransferTx)
            ReturnsEntity().apply {
                code = if (sendRawTransaction.startsWith("0x")) 200 else 500
                msg = sendRawTransaction
            }
        }
    }

    suspend fun bondAndNomiinate(privkey: String, address: String, amount: String, targets: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            val conversion = if (isTest()) 1000000000000 else 10000000000
            val conversionAmount = DecimalFormat("0").format(amount.toDouble() * conversion)
            val generateTransferTx = DOTApiLibrary.INSTANCE.bondAndNominate(getDOTUrl(), "", address, address, conversionAmount, targets, privkey)
            val sendRawTransaction = DOTApiLibrary.INSTANCE.sendRawTransaction(getDOTUrl(), "", generateTransferTx)
            ReturnsEntity().apply {
                code = if (sendRawTransaction.startsWith("0x")) 200 else 500
                msg = sendRawTransaction
            }
        }
    }

    suspend fun bondAndNomiinateFee(privkey: String, address: String, amount: String, targets: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val conversion = if (isTest()) 1000000000000 else 10000000000
                val conversionAmount = DecimalFormat("0").format(amount.toDouble() * conversion)
                val generateTransferTx = DOTApiLibrary.INSTANCE.bondAndNominate(getDOTUrl(), "", address, address, conversionAmount, targets, privkey)
                val fees = DOTApiLibrary.INSTANCE.estimateFeesForTransactionV2(getDOTUrl(), "", generateTransferTx)
                DecimalFormat("0.########").format(fees.toDouble() / conversion)
            }catch (e:Exception){
                "0"
            }
        }
    }

    suspend fun bondExtra(privkey: String, address: String, amount: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            val conversion = if (isTest()) 1000000000000 else 10000000000
            val conversionAmount = DecimalFormat("0").format(amount.toDouble() * conversion)
            val generateTransferTx = DOTApiLibrary.INSTANCE.bondExtra(getDOTUrl(), "", address, conversionAmount, privkey)
            val sendRawTransaction = DOTApiLibrary.INSTANCE.sendRawTransaction(getDOTUrl(), "", generateTransferTx)
            ReturnsEntity().apply {
                code = if (sendRawTransaction.startsWith("0x")) 200 else 500
                msg = sendRawTransaction
            }
        }
    }

    suspend fun bondExtraFee(privkey: String, address: String, amount: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val conversion = if (isTest()) 1000000000000 else 10000000000
                val conversionAmount = DecimalFormat("0").format(amount.toDouble() * conversion)
                val generateTransferTx = DOTApiLibrary.INSTANCE.bondExtra(getDOTUrl(), "", address, conversionAmount, privkey)
                val fees = DOTApiLibrary.INSTANCE.estimateFeesForTransactionV2(getDOTUrl(), "", generateTransferTx)
                DecimalFormat("0.########").format(fees.toDouble() / conversion)
            }catch (e:Exception){
                "0"
            }
        }
    }

    suspend fun chillAndUnbond(privkey: String, address: String, amount: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            val conversion = if (isTest()) 1000000000000 else 10000000000
            val conversionAmount = DecimalFormat("0").format(amount.toDouble() * conversion)
            val generateTransferTx = DOTApiLibrary.INSTANCE.chillAndUnbond(getDOTUrl(), "", address, conversionAmount, privkey)
            val sendRawTransaction = DOTApiLibrary.INSTANCE.sendRawTransaction(getDOTUrl(), "", generateTransferTx)
            ReturnsEntity().apply {
                code = if (sendRawTransaction.startsWith("0x")) 200 else 500
                msg = sendRawTransaction
            }
        }
    }

    suspend fun chillAndUnbondFee(privkey: String, address: String, amount: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val conversion = if (isTest()) 1000000000000 else 10000000000
                val conversionAmount = DecimalFormat("0").format(amount.toDouble() * conversion)
                val generateTransferTx = DOTApiLibrary.INSTANCE.chillAndUnbond(getDOTUrl(), "", address, conversionAmount, privkey)
                val fees = DOTApiLibrary.INSTANCE.estimateFeesForTransactionV2(getDOTUrl(), "", generateTransferTx)
                DecimalFormat("0.########").format(fees.toDouble() / conversion)
            }catch (e:Exception){
                "0"
            }
        }
    }

    suspend fun withDraw(privkey: String, address: String): ReturnsEntity {
        return withContext(Dispatchers.IO) {
            val generateTransferTx = DOTApiLibrary.INSTANCE.withDraw(getDOTUrl(), "", address, privkey, 0)
            val sendRawTransaction = DOTApiLibrary.INSTANCE.sendRawTransaction(getDOTUrl(), "", generateTransferTx)
            ReturnsEntity().apply {
                code = if (sendRawTransaction.startsWith("0x")) 200 else 500
                msg = sendRawTransaction
            }
        }
    }

    suspend fun withDrawFee(privkey: String, address: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val conversion = if (isTest()) 1000000000000 else 10000000000
                val generateTransferTx = DOTApiLibrary.INSTANCE.withDraw(getDOTUrl(), "", address, privkey, 0)
                val fees = DOTApiLibrary.INSTANCE.estimateFeesForTransactionV2(getDOTUrl(), "", generateTransferTx)
                DecimalFormat("0.########").format(fees.toDouble() / conversion)
            }catch (e:Exception){
                "0"
            }
        }
    }

    /**
     * 0不存在 1pending（打包中） 2成功 3失败
     */
    suspend fun getStatus(hash: String): Int {
        return withContext(Dispatchers.IO) {
            val generateTransferTx = DOTApiLibrary.INSTANCE.getTransactionStatusV2(getDOTUrl(), BuildConfig.DOT_SCAN_1_URL, hash, BuildConfig.DOT_SCAN_API_KEY)
            if (generateTransferTx == "2")
                return@withContext 1
            else
                return@withContext 0
        }
    }

}