// @ts-nocheck
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import { BN } from 'bn.js';
import Balance from 'types/Balance';
import Version from 'types/Version';
import Api, { ApiConfig } from 'manta-wasm-wallet-api';
import * as axios from 'axios';
import { base58Decode, base58Encode } from '@polkadot/util-crypto';
import TxStatus from 'types/TxStatus';
import mapPostToTransaction from 'utils/api/MapPostToTransaction';
import signerIsOutOfDate from 'utils/validation/signerIsOutOfDate';
import { useExternalAccount } from './externalAccountContext';
import { useSubstrate } from './substrateContext';
import { useTxStatus } from './txStatusContext';
import NETWORK from '../constants/NetworkConstants';
import { useConfig } from './configContext';
import { MantaSdk, init, Network, Environment } from 'manta.js';

const PrivateWalletContext = createContext();

const DolphinNetwork = NETWORK.DOLPHIN;
//const CalamariNetwork = network.calamari;
//const MantaNetwork = network.manta;

export const PrivateWalletContextProvider = (props) => {
  // external contexts
  const config = useConfig();
  const { api, socket } = useSubstrate();
  const { externalAccountSigner } = useExternalAccount();
  const { setTxStatus, txStatusRef } = useTxStatus();

  // wasm wallet
  const [privateAddress, setPrivateAddress] = useState(null);
  //const [wallet, setWallet] = useState(null);
  //const [wasm, setWasm] = useState(null);
  //const [wasmApi, setWasmApi] = useState(null);

  // signer connection
  const [signerIsConnected, setSignerIsConnected] = useState(null);
  const [signerVersion, setSignerVersion] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const isInitialSync = useRef(false);
  const walletIsBusy = useRef(false);

  // manta SDK
  const [sdk, setSdk] = useState(null);

  // transaction state
  const txQueue = useRef([]);
  const finalTxResHandler = useRef(null);
  const balancesAreStale = useRef(false);

  // current network - currently hardcoded as Dolphin
  // @TODO: Link this with the correct currently selected network.
  // @TODO: Add useEffect() to call initWallet() upon change in network.
  const [currentNetwork, _setCurrentNetwork] = useState(DolphinNetwork);

  useEffect(() => {
    setIsReady(sdk && signerIsConnected);
  }, [sdk, signerIsConnected]);

  // WASM wallet must be reinitialized when socket changes
  // because the old api will have been disconnected
  useEffect(() => {
    setIsReady(false);
  }, [socket]);

  useEffect(() => {
    /*
    const getPrivateAddress = async (wasm, wallet) => {
      const keys = await wallet.address(
        wasm.Network.from_string(`"${currentNetwork}"`)
      );
      const privateAddressRaw = keys[0];
      const privateAddressBytes = [
        ...privateAddressRaw.spend,
        ...privateAddressRaw.view
      ];
      return base58Encode(privateAddressBytes);
    };
    */

    const canInitWallet = () => {
      return (
        api
        && externalAccountSigner
        && signerIsConnected
        && signerVersion
        && !signerIsOutOfDate(config, signerVersion)
        && !isInitialSync.current
      );
    };

    const initWallet = async () => {
      console.log('INITIALIZING WALLET');
      isInitialSync.current = true;
      /*
      const wasm = await import('manta-wasm-wallet');
      const wasmSigner = new wasm.Signer(config.SIGNER_URL);
      const DEFAULT_PULL_SIZE = 4096;
      const wasmApiConfig = new ApiConfig(
        api, externalAccountSigner, DEFAULT_PULL_SIZE, DEFAULT_PULL_SIZE
      );
      const wasmApi = new Api(wasmApiConfig);
      const wasmLedger = new wasm.PolkadotJsLedger(wasmApi);
      const wasmWallet = new wasm.Wallet(wasmLedger, wasmSigner);
      const networkType = wasm.Network.from_string(`"${currentNetwork}"`);
      */
      // @TODO: Handle network type properlly for sdk.
      // Currently hard coding it as Dolphin upon initialization.
      
      const TEST2 = "";
      // const TEST2 = "5DknaTvGdxGTT5yHQCgXhPdj6zgcjhnGuPYN9qVgNAGTVxZ7";
      const mantaSdk = await init(Environment.Development, Network.Dolphin, TEST2);
      const privateAddress = await mantaSdk.privateAddress();
      console.log("The private address is: ", privateAddress);
      setPrivateAddress(privateAddress);
      await mantaSdk.initalWalletSync();
      /*
      console.log('Beginning initial sync');
      const startTime = performance.now();
      await wasmWallet.restart(networkType);
      const endTime = performance.now();
      console.log(
        `Initial sync finished in ${(endTime - startTime) / 1000} seconds`
      );
      
      setWasm(wasm);
      setWasmApi(wasmApi);
      setWallet(wasmWallet);
      */
      setSdk(mantaSdk);
      isInitialSync.current = false;
    };

    if (canInitWallet() && !isReady) {
      initWallet();
    }
  }, [api, externalAccountSigner, signerIsConnected, signerVersion]);

  const fetchSignerVersion = async () => {
    try {
      const res = await axios.get(`${config.SIGNER_URL}version`, {
        timeout: 1500
      });
      const signerVersion = res.data;
      const signerIsConnected = !!signerVersion;
      setSignerIsConnected(signerIsConnected);
      if (signerIsConnected) {
        setSignerVersion(new Version(signerVersion));
      } else {
        setSignerIsConnected(signerIsConnected);
        setSignerVersion(null);
        setSdk(null);
        //setWasm(null);
        setPrivateAddress(null);
        //setWasmApi(null);
        //setWallet(null);
        isInitialSync.current = false;
      }
    } catch (err) {
      console.error(err);
      setSignerIsConnected(false);
      setSignerVersion(null);
      setSdk(null);
      //setWasm(null);
      setPrivateAddress(null);
      //setWasmApi(null);
      //setWallet(null);
      isInitialSync.current = false;
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      fetchSignerVersion();
    }, 2000);
    return () => clearInterval(interval);
  }, [api, sdk]);

  // WASM wallet doesn't allow you to call two methods at once, so before
  // calling methods it is necessary to wait for a pending call to finish
  const waitForWallet = async () => {
    while (walletIsBusy.current === true) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  const sync = async () => {
    // Don't refresh while wallet is busy to avoid panics in manta-wasm-wallet;
    // Don't refresh during a transaction to prevent stale balance updates
    // from being applied after the transaction is finished
    if (walletIsBusy.current === true || txStatusRef.current?.isProcessing()) {
      return;
    }
    walletIsBusy.current = true;
    try {
      console.log("syncing");
      /*
      console.log('Beginning sync');
      const startTime = performance.now();
      const networkType = wasm.Network.from_string(`"${currentNetwork}"`);
      await wallet.sync(networkType);
      const endTime = performance.now();
      console.log(`Sync finished in ${(endTime - startTime) / 1000} seconds`);
      */
      await sdk.walletSync();
      balancesAreStale.current = false;
    } catch (error) {
      console.error('Sync failed', error);
    }
    walletIsBusy.current = false;
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isReady) {
        sync();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isReady]);

  const getSpendableBalance = async (assetType) => {
    if (!isReady || balancesAreStale.current) {
      return null;
    }
    await waitForWallet();

    const assetIdAsU8Array = await sdk.numberToAssetIdArray(assetType.assetId);
    const balanceRaw = await sdk.privateBalance(assetIdAsU8Array);
    //const balanceRaw = wallet.balance(new wasm.AssetId(assetType.assetId));
    return new Balance(assetType, new BN(balanceRaw));
  };

  const handleInternalTxRes = async ({ status, events }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (sdk.api.events.utility.BatchInterrupted.is(event.event)) {
          setTxStatus(TxStatus.failed());
          txQueue.current = [];
          console.error('Internal transaction failed', event);
        }
      }
    } else if (status.isFinalized) {
      console.log('Internal transaction finalized');
      await publishNextBatch();
    }
  };

  const publishNextBatch = async () => {
    const sendExternal = async () => {
      try {
        const lastTx = txQueue.current.shift();
        await lastTx.signAndSend(
          externalAccountSigner,
          finalTxResHandler.current
        );
      } catch (e) {
        setTxStatus(TxStatus.failed());
        txQueue.current = [];
      }
    };

    const sendInternal = async () => {
      try {
        const internalTx = txQueue.current.shift();
        await internalTx.signAndSend(
          externalAccountSigner,
          handleInternalTxRes
        );
      } catch (e) {
        setTxStatus(TxStatus.failed());
        txQueue.current = [];
      }
    };

    if (txQueue.current.length === 0) {
      return;
    } else if (txQueue.current.length === 1) {
      sendExternal();
    } else {
      sendInternal();
    }
  };

  /*
  const convertToOldPost = (post) => {
    // need to iterate over all receiverPosts and convert EncryptedNote from new
    // format of EncryptedNote { header: (), Ciphertext {...} } to old format:
    // EncryptedNote { ephermeral_public_key: [], ciphertext: [] }

    let postCopy = JSON.parse(JSON.stringify(post));
    postCopy.receiver_posts.map(x => {x.encrypted_note = x.encrypted_note.ciphertext});
    return postCopy
  }


  async function buildExtrinsics(transaction, assetMetadata, networkType) {
    const posts = await wallet.sign(transaction, assetMetadata, networkType);
    const transactions = [];
    for (let i = 0; i < posts.length; i++) {
      let convertedPost = convertToOldPost(posts[i]);
      const transaction = await mapPostToTransaction(convertedPost, api);
      transactions.push(transaction);
    }
    return transactions;
  }

  async function transactionsToBatches(transactions) {
    const MAX_BATCH = 2;
    const batches = [];
    for (let i = 0; i < transactions.length; i += MAX_BATCH) {
      const transactionsInSameBatch = transactions.slice(i, i + MAX_BATCH);
      const batchTransaction = await api.tx.utility.batch(
        transactionsInSameBatch
      );
      batches.push(batchTransaction);
    }
    return batches;
  }

  const publishBatchesSequentially = async (transactions, txResHandler) => {
    const batches = await transactionsToBatches(transactions);

    txQueue.current = batches;
    finalTxResHandler.current = txResHandler;

    try {
      publishNextBatch();
      return true;
    } catch (e) {
      console.error('Sequential baching failed', e);
      return false;
    }
  };

  */

  const toPublic = async (balance, txResHandler, network=currentNetwork) => {
    // build wasm params
    /*
    const value = balance.valueAtomicUnits.toString();
    const assetId = balance.assetType.assetId;
    const txJson = `{ "Reclaim": { "id": ${assetId}, "value": "${value}" }}`;
    const transaction = wasm.Transaction.from_string(txJson);
    const assetMetadataJson = `{ "decimals": ${balance.assetType.numberOfDecimals} , "symbol": "${balance.assetType.ticker}" }`;
    const assetMetadata = wasm.AssetMetadata.from_string(assetMetadataJson);
    const networkType = wasm.Network.from_string(`"${network}"`);
    */
    const assetId = balance.assetType.assetId;
    const assetIdAsU8Array = await sdk.numberToAssetIdArray(assetId);
    const value = parseInt(balance.valueAtomicUnits.toString());
    try {
      await waitForWallet();
      walletIsBusy.current = true;
      //const transactions = await buildExtrinsics(transaction, assetMetadata, networkType);
      const res = await sdk.toPublic(assetIdAsU8Array, value);
      walletIsBusy.current = false;
      //const res = await publishBatchesSequentially(transactions, txResHandler);

      // @TODO: Implement proper transaction response handling using txResHandler functions
      // Remove this temporary solution
      setTxStatus(TxStatus.finalized(""));
      balancesAreStale.current = true;
      return res;
    } catch (error) {
      console.error('Transaction failed', error);
      setTxStatus(TxStatus.failed());
      walletIsBusy.current = false;
      return false;
    }
  };

  const toPublicNFT = async (balance, txResHandler, network=currentNetwork) => {
    // build wasm params
    /*
    const value = balance.valueAtomicUnits.toString();
    const assetId = balance.assetType.assetId;
    const txJson = `{ "Reclaim": { "id": ${assetId}, "value": "${value}" }}`;
    const transaction = wasm.Transaction.from_string(txJson);
    const assetMetadataJson = `{ "decimals": ${balance.assetType.numberOfDecimals} , "symbol": "${balance.assetType.ticker}" }`;
    const assetMetadata = wasm.AssetMetadata.from_string(assetMetadataJson);
    const networkType = wasm.Network.from_string(`"${network}"`);
    */
    const assetId = balance.assetType.assetId;
    const assetIdAsU8Array = await sdk.numberToAssetIdArray(assetId);
    const value = parseInt(balance.valueAtomicUnits.toString());
    try {
      await waitForWallet();
      walletIsBusy.current = true;
      //const transactions = await buildExtrinsics(transaction, assetMetadata, networkType);
      const res = await sdk.toPublicNFT(assetIdAsU8Array);
      walletIsBusy.current = false;
      //const res = await publishBatchesSequentially(transactions, txResHandler);

      // @TODO: Implement proper transaction response handling using txResHandler functions
      // Remove this temporary solution
      setTxStatus(TxStatus.finalized(""));
      balancesAreStale.current = true;
      return res;
    } catch (error) {
      console.error('Transaction failed', error);
      setTxStatus(TxStatus.failed());
      walletIsBusy.current = false;
      return false;
    }
  };

  const privateTransfer = async (balance, recipient, txResHandler, network=currentNetwork) => {
    // build wasm params
    /*
    const addressJson = privateAddressToJson(recipient);
    const value = balance.valueAtomicUnits.toString();
    const assetId = balance.assetType.assetId;
    const txJson = `{ "PrivateTransfer": [{ "id": ${assetId}, "value": "${value}" }, ${addressJson} ]}`;
    const transaction = wasm.Transaction.from_string(txJson);
    const assetMetadataJson = `{ "decimals": ${balance.assetType.numberOfDecimals} , "symbol": "${balance.assetType.ticker}" }`;
    const assetMetadata = wasm.AssetMetadata.from_string(assetMetadataJson);;
    const networkType = wasm.Network.from_string(`"${network}"`);
    */
    const assetId = balance.assetType.assetId;
    const assetIdAsU8Array = await sdk.numberToAssetIdArray(assetId);
    const value = parseInt(balance.valueAtomicUnits.toString());
    try {
      await waitForWallet();
      walletIsBusy.current = true;
      const res = await sdk.privateTransfer(assetIdAsU8Array, value, recipient);
      //const transactions = await buildExtrinsics(transaction, assetMetadata, networkType);
      walletIsBusy.current = false;
      //const res = await publishBatchesSequentially(transactions, txResHandler);

      // @TODO: Implement proper transaction response handling using txResHandler functions
      // Remove this temporary solution
      setTxStatus(TxStatus.finalized(""));
      balancesAreStale.current = true;
      return res;
    } catch (error) {
      console.error('Transaction failed', error);
      setTxStatus(TxStatus.failed());
      walletIsBusy.current = false;
      return false;
    }
  };

  const privateTransferNFT = async (balance, recipient, txResHandler, network=currentNetwork) => {
    // build wasm params
    /*
    const addressJson = privateAddressToJson(recipient);
    const value = balance.valueAtomicUnits.toString();
    const assetId = balance.assetType.assetId;
    const txJson = `{ "PrivateTransfer": [{ "id": ${assetId}, "value": "${value}" }, ${addressJson} ]}`;
    const transaction = wasm.Transaction.from_string(txJson);
    const assetMetadataJson = `{ "decimals": ${balance.assetType.numberOfDecimals} , "symbol": "${balance.assetType.ticker}" }`;
    const assetMetadata = wasm.AssetMetadata.from_string(assetMetadataJson);;
    const networkType = wasm.Network.from_string(`"${network}"`);
    */
    const assetId = balance.assetType.assetId;
    const assetIdAsU8Array = await sdk.numberToAssetIdArray(assetId);
    const value = parseInt(balance.valueAtomicUnits.toString());
    try {
      await waitForWallet();
      walletIsBusy.current = true;
      const res = await sdk.privateTransferNFT(assetIdAsU8Array, recipient);
      //const transactions = await buildExtrinsics(transaction, assetMetadata, networkType);
      walletIsBusy.current = false;
      //const res = await publishBatchesSequentially(transactions, txResHandler);

      // @TODO: Implement proper transaction response handling using txResHandler functions
      // Remove this temporary solution
      setTxStatus(TxStatus.finalized(""));
      balancesAreStale.current = true;
      return res;
    } catch (error) {
      console.error('Transaction failed', error);
      setTxStatus(TxStatus.failed());
      walletIsBusy.current = false;
      return false;
    }
  };

  const toPrivate = async (balance, txResHandler, network=currentNetwork) => {
    await waitForWallet();
    walletIsBusy.current = true;
    /*
    const value = balance.valueAtomicUnits.toString();
    const assetId = balance.assetType.assetId;
    const txJson = `{ "Mint": { "id": ${assetId}, "value": "${value}" }}`;
    const transaction = wasm.Transaction.from_string(txJson);
    const networkType = wasm.Network.from_string(`"${network}"`);
    */
    sdk.wasmApi.txResHandler = txResHandler;
    sdk.wasmApi.externalAccountSigner = externalAccountSigner;
    const assetId = balance.assetType.assetId;
    const assetIdAsU8Array = await sdk.numberToAssetIdArray(assetId);
    const value = parseInt(balance.valueAtomicUnits.toString());
    try {
      const res = await sdk.toPrivateSign(assetIdAsU8Array,value);
      //const res = await wallet.post(transaction, null, networkType);
      walletIsBusy.current = false;        
      
      
      // @TODO: Implement proper transaction response handling using txResHandler functions
      // Remove this temporary solution
      setTxStatus(TxStatus.finalized(""));
      balancesAreStale.current = true;
  
      return res;
    } catch (error) {
      console.error('Transaction failed', error);
      setTxStatus(TxStatus.failed());
      walletIsBusy.current = false;
      return false;
    }
  };

  const toPrivateNFT = async (balance, txResHandler, network=currentNetwork) => {
    await waitForWallet();
    walletIsBusy.current = true;
    /*
    const value = balance.valueAtomicUnits.toString();
    const assetId = balance.assetType.assetId;
    const txJson = `{ "Mint": { "id": ${assetId}, "value": "${value}" }}`;
    const transaction = wasm.Transaction.from_string(txJson);
    const networkType = wasm.Network.from_string(`"${network}"`);
    */
    sdk.wasmApi.txResHandler = txResHandler;
    sdk.wasmApi.externalAccountSigner = externalAccountSigner;
    const assetId = balance.assetType.assetId;
    const assetIdAsU8Array = await sdk.numberToAssetIdArray(assetId);
    try {
      const res = await sdk.toPrivateNFT(assetIdAsU8Array);
      //const res = await wallet.post(transaction, null, networkType);
      walletIsBusy.current = false;        
      
      
      // @TODO: Implement proper transaction response handling using txResHandler functions
      // Remove this temporary solution
      setTxStatus(TxStatus.finalized(""));
      balancesAreStale.current = true;
  
      return res;
    } catch (error) {
      console.error('Transaction failed', error);
      setTxStatus(TxStatus.failed());
      walletIsBusy.current = false;
      return false;
    }
  };

  /*
  const privateAddressToJson = (privateAddress) => {
    const bytes = base58Decode(privateAddress);
    return JSON.stringify({
      spend: Array.from(bytes.slice(0, 32)),
      view: Array.from(bytes.slice(32))
    });
  };
  */

  const value = {
    isReady,
    privateAddress,
    getSpendableBalance,
    toPrivate,
    toPublic,
    privateTransfer,
    toPrivateNFT,
    toPublicNFT,
    privateTransferNFT,
    sync,
    signerIsConnected,
    signerVersion,
    isInitialSync,
    walletIsBusy,
    balancesAreStale,
    sdk
  };

  return (
    <PrivateWalletContext.Provider value={value}>
      {props.children}
    </PrivateWalletContext.Provider>
  );
};

PrivateWalletContextProvider.propTypes = {
  children: PropTypes.any
};

export const usePrivateWallet = () => ({ ...useContext(PrivateWalletContext) });