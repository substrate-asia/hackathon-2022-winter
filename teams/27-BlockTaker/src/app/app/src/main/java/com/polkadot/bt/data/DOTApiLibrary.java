package com.polkadot.bt.data;

import com.sun.jna.Library;
import com.sun.jna.Native;

/**
 * Create:NoahZhao
 * Date:2022/12/7 18:21
 * Description:TestLibrary
 */
public interface DOTApiLibrary extends Library {

    DOTApiLibrary INSTANCE = Native.load("PolkaApi", DOTApiLibrary.class);

    String perform(String url);

    String getBalance(String rpcurl, String scanurl, String address);

    String fetchTransactionDetail(String rpcurl, String scanurl, String txhash);

    String newAccountWithMnemonic(String mnemonic, int network);

    String accountWithPrivKey(String privateKey, int network);

    String sendRawTransaction(String rpcurl, String scanurl, String signTX);

    String signTX(String privkey, String data);

    String generateTransferSignData(String rpcurl, String scanUrl, String from, String to, String amount);

    String generateTransferTx(String rpcurl, String scanUrl, String from, String to, String amount, String privkey);

    String generateSendTx(String metadata, String txhash, String sigdata, String privkey);

    String getTransactionStatusV2(String rpcurl, String scanurl, String txHexStr, String apikey);

    String generateTransferHex(String rpcurl, String dest, String amount);

    String estimateFeesForTransaction(String rpcurl, String scanurl, String txhash);

    String estimateFeesForTransactionV2(String rpcurl, String scanurl, String sendtx);

    String stakeBound(String rpcurl, String scanUrl, String stash, String controller, String value, String payee, String privkey);

    String stakeNominate(String rpcurl, String scanUrl, String stash, String targets, String privkey);

    String stakeUnbond(String rpcurl, String scanUrl, String stash, String value, String privkey);

    String withDraw(String rpcurl, String scanUrl, String stash, String privkey, int span);

    String chillAndUnbond(String rpcurl, String scanUrl, String stash, String value, String privkey);

    String bondAndNominate(String rpcurl, String scanUrl, String stash, String controller, String value, String targets, String privkey);

    String bondExtra(String rpcurl, String scanUrl, String stash, String value, String privkey);

    String getAccountStatus(String rpcurl, String scanurl, String accStr, String apikey);
}
