// @ts-nocheck
import React, { useReducer, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSubstrate } from 'contexts/substrateContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import Balance from 'types/Balance';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import BN from 'bn.js';
import { useTxStatus } from 'contexts/txStatusContext';
import TxStatus from 'types/TxStatus';
import AssetType from 'types/AssetType';
import { FAILURE as WASM_WALLET_FAILURE } from 'manta-wasm-wallet-api';
import { setLastAccessedExternalAccountAddress } from 'utils/persistence/externalAccountStorage';
import extrinsicWasSentByUser from 'utils/api/ExtrinsicWasSendByUser';
import { useConfig } from 'contexts/configContext';
import SEND_ACTIONS from './sendActions';
import sendReducer, { SEND_INIT_STATE } from './sendReducer';
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";
import { useNft } from 'contexts/nftContext';

const SendContext = React.createContext();

export const SendContextProvider = (props) => {
  const config = useConfig();
  const { api } = useSubstrate();
  const { setTxStatus, txStatus } = useTxStatus();
  const {
    externalAccount,
    externalAccountSigner,
    externalAccountOptions,
    changeExternalAccount
  } = useExternalAccount();
  const privateWallet = usePrivateWallet();
  const { isReady: privateWalletIsReady, privateAddress } = privateWallet;

  const {currentPage} = useNft();

  const initState = { ...SEND_INIT_STATE };
  const [state, dispatch] = useReducer(sendReducer, initState);
  const {
    senderAssetType,
    senderAssetCurrentBalance,
    senderAssetTargetBalance,
    senderNativeTokenPublicBalance,
    senderPublicAccount,
    receiverAssetType,
    receiverAddress,
  } = state;

  /**fe
   * Initialization logic
   */

  // Adds the user's polkadot.js accounts to state on pageload
  // These populate public address select dropdowns in the ui
  useEffect(() => {
    const initPublicAccountOptions = () => {
      dispatch({
        type: SEND_ACTIONS.SET_SENDER_PUBLIC_ACCOUNT_OPTIONS,
        senderPublicAccountOptions: externalAccountOptions
      });
    };
    initPublicAccountOptions();
  }, [externalAccountOptions]);

  // Adds the user's default private address to state on pageload
  useEffect(() => {
    const initSenderPrivateAddress = () => {
      dispatch({
        type: SEND_ACTIONS.SET_SENDER_PRIVATE_ADDRESS,
        senderPrivateAddress: privateAddress
      });
    };
    initSenderPrivateAddress();
    if (privateAddress && isToPrivate()) {
      setReceiver(privateAddress);
    }
  }, [privateAddress]);

  /**
   * External state
   */

  useEffect(() => {

    if (currentPage !== "TRANSACT") {
      const targetAsset = AssetType.Nft(senderAssetType.isPrivate, 0);
      setSelectedAssetType(targetAsset);
      setSenderAssetTargetBalance(null);
    }

  },[currentPage])


  // Synchronizes the user's current 'active' public account in local state
  // to macth its upstream source of truth in `externalAccountContext`
  // The active `senderPublicAccount` receivs `toPublic` payments,
  // send `toPrivate` and `publicTransfer` payments, and covers fees for all payments
  useEffect(() => {
    const syncPublicAccountToExternalAccount = () => {
      dispatch({
        type: SEND_ACTIONS.SET_SENDER_PUBLIC_ACCOUNT,
        senderPublicAccount: externalAccount
      });
    };
    syncPublicAccountToExternalAccount();
  }, [externalAccount]);

  // Sets the polkadot.js signing and fee-paying account in 'externalAccountContext'
  // to match the user's public account as set in the send form
  useEffect(() => {
    const syncExternalAccountToPublicAccount = () => {
      if (isToPublic()) {
        const externalAccount = externalAccountOptions.find(
          (account) => account.address === receiverAddress
        );
        externalAccount && changeExternalAccount(externalAccount);
      } else if (senderIsPublic()) {
        senderPublicAccount && changeExternalAccount(senderPublicAccount);
      }
    };
    syncExternalAccountToPublicAccount();
  }, [
    receiverAddress,
    senderAssetType,
    receiverAssetType,
    externalAccountOptions
  ]);

  /**
   *
   * Mutations exposed through UI
   */

  // Sets the sender's public account, exposed in the `To Public` and `Public transfer` form;
  // State is set upstream in `externalAccountContext`, and propagates downstream here
  // (see `syncPublicAccountToExternalAccount` above)
  const setSenderPublicAccount = async (senderPublicAccount) => {
    setLastAccessedExternalAccountAddress(config, senderPublicAccount.address);
    await changeExternalAccount(senderPublicAccount);
  };

  // Toggles the private/public status of the sender's account
  const toggleSenderIsPrivate = () => {
    dispatch({ type: SEND_ACTIONS.TOGGLE_SENDER_ACCOUNT_IS_PRIVATE });
  };

  // Toggles the private/public status of the receiver's account
  const toggleReceiverIsPrivate = () => {
    dispatch({
      type: SEND_ACTIONS.TOGGLE_RECEIVER_ACCOUNT_IS_PRIVATE,
      privateAddress: privateWallet.privateAddress
    });
  };

  // Sets the asset type to be transacted
  const setSelectedAssetType = (selectedAssetType) => {
    dispatch({ type: SEND_ACTIONS.SET_SELECTED_ASSET_TYPE, selectedAssetType });
  };

  // Sets the balance the user intends to send
  const setSenderAssetTargetBalance = (senderAssetTargetBalance) => {
    dispatch({
      type: SEND_ACTIONS.SET_SENDER_ASSET_TARGET_BALANCE,
      senderAssetTargetBalance
    });
  };

  // Sets the intended recipient of the transaction, whether public or private
  const setReceiver = (receiverAddress) => {
    dispatch({
      type: SEND_ACTIONS.SET_RECEIVER,
      receiverAddress
    });
  };

  /**
   *
   * Balance refresh logic
   */

  // Dispatches the receiver's balance in local state if the user would be sending a payment internally
  // i.e. if the user is sending a `To Private` or `To Public` transaction
  const setReceiverCurrentBalance = (receiverCurrentBalance) => {
    dispatch({
      type: SEND_ACTIONS.SET_RECEIVER_CURRENT_BALANCE,
      receiverCurrentBalance
    });
  };

  // Dispatches the user's available balance to local state for the currently selected account and asset
  const setSenderAssetCurrentBalance = (
    senderAssetCurrentBalance,
    senderPublicAddress
  ) => {
    dispatch({
      type: SEND_ACTIONS.SET_SENDER_ASSET_CURRENT_BALANCE,
      senderAssetCurrentBalance,
      senderPublicAddress
    });
  };

  // Dispatches the user's available public balance for the currently selected fee-paying account to local state
  const setSenderNativeTokenPublicBalance = (
    senderNativeTokenPublicBalance
  ) => {
    dispatch({
      type: SEND_ACTIONS.SET_SENDER_NATIVE_TOKEN_PUBLIC_BALANCE,
      senderNativeTokenPublicBalance
    });
  };

  const convertAllNetworksAddressToDolphinAddress = (address) => {

    // calamari/dolphin ss58 encoding is 78
    const encoding = 78;
    const buffer = decodeAddress(address);
    const hex = u8aToHex(buffer);
    const encoded = encodeAddress(hex,encoding);
    return encoded;
  }

  // Gets available public balance for some public address and asset type
  const fetchPublicBalance = async (address, assetType) => {
    if (!api?.isConnected || !address || !privateWallet.sdk) {
      return null;
    }

    if (assetType.assetId == 1) {
      return new Balance(assetType, new BN("0"));
    }

    if (assetType.isNativeToken) {
      const balance = await fetchNativeTokenPublicBalance(address);
      return balance;
    }
    //const account = await api.query.assets.account(assetType.assetId, address);

    const convertedAddress = convertAllNetworksAddressToDolphinAddress(address);
    const assetIdArray = await privateWallet.sdk.numberToAssetIdArray(assetType.assetId);
    const assetOwner = await privateWallet.sdk.getNFTOwner(assetIdArray);

    let balanceString = "";

    if (assetOwner.toLowerCase() === convertedAddress.toLowerCase()) {
      balanceString = "1";
    } else {
      balanceString = "0";
    }
    /*
    const balanceString = account.value.isEmpty
      ? '0'
      : account.value.balance.toString();
    */
    return new Balance(assetType, new BN(balanceString));
  };

  // Gets available native public balance for some public address;
  // This is currently a special case because querying native token balnces
  // requires a different api call
  const fetchNativeTokenPublicBalance = async (address) => {
    if (!api?.isConnected || !address) {
      return null;
    }
    const balances = await api.derive.balances.account(address);
    return Balance.Native(config, new BN(balances.freeBalance.toString()));
  };

  // Gets the available balance for the currently selected sender account, whether public or private
  const fetchSenderBalance = async () => {

    if (!senderAssetType.isPrivate) {
      const publicBalance = await fetchPublicBalance(
        senderPublicAccount?.address,
        senderAssetType
      );
      //console.log(publicBalance.valueAtomicUnits.toString());
      setSenderAssetCurrentBalance(publicBalance, senderPublicAccount?.address);
      // private balances cannot be queries while a transaction is processing
      // because web assambly wallet panics if asked to do two things at a time
    } else if (senderAssetType.isPrivate && !txStatus?.isProcessing()) {
      const privateBalance = await privateWallet.getSpendableBalance(
        senderAssetType
      );

      let privateNFTBalance;

      if (privateBalance) {
        if (privateBalance.valueAtomicUnits.toString() === "1000000000000") {
          privateNFTBalance = new Balance(privateBalance.assetType,new BN("1"));
        } else {
          privateNFTBalance = privateBalance;
        }
      }

      setSenderAssetCurrentBalance(
        privateNFTBalance,
        senderPublicAccount?.address
      );
    }
  };

  // Gets the available balance for the currently selected sender account, whether public or private
  // if the user would be sending a payment internally i.e. if the user is sending a `To Private` or `To Public` transaction
  const fetchReceiverBalance = async () => {
    // Send pay doesn't display receiver balances if the receiver is external
    if (isPrivateTransfer()) {
      setReceiverCurrentBalance(null);
      // private balances cannot be queried while a transaction is processing
      // because the private web assambly wallet panics if asked to do two things at a time
    } else if (isToPrivate() && !txStatus?.isProcessing()) {
      const privateBalance = await privateWallet.getSpendableBalance(
        receiverAssetType
      );
      setReceiverCurrentBalance(privateBalance);
    } else if (receiverIsPublic()) {
      const publicBalance = await fetchPublicBalance(
        receiverAddress,
        receiverAssetType
      );
      setReceiverCurrentBalance(publicBalance);
    }
  };

  // Gets the available public balance for the user's public account set to pay transaction fee
  const fetchFeeBalance = async () => {
    if (!api?.isConnected || !externalAccount) {
      return;
    }
    const address = externalAccount.address;
    const balance = await fetchNativeTokenPublicBalance(address);
    setSenderNativeTokenPublicBalance(balance, address);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSenderBalance();
      fetchReceiverBalance();
      fetchFeeBalance();
    }, 200);
    return () => clearInterval(interval);
  }, [
    senderAssetType,
    externalAccount,
    receiverAddress,
    senderPublicAccount,
    receiverAssetType,
    api,
    privateWalletIsReady,
    txStatus
  ]);

  /**
   *
   * Transaction validation
   */

  // Gets the highest amount the user is allowed to send for the currently
  // selected asset
  const getMaxSendableBalance = () => {
    if (!senderAssetCurrentBalance || !senderNativeTokenPublicBalance) {
      return null;
    }
    if (senderAssetType.isNativeToken && !senderAssetType.isPrivate) {
      const reservedNativeTokenBalance = getReservedNativeTokenBalance();
      const zeroBalance = new Balance(senderAssetType, new BN(0));
      return Balance.max(
        senderAssetCurrentBalance.sub(reservedNativeTokenBalance),
        zeroBalance
      );
    }
    return senderAssetCurrentBalance.valueOverExistentialDeposit();
  };

  // Gets the amount of the native token the user is not allowed to go below
  // If the user attempts a transaction with less than this amount of the
  // native token, the transaction will fail
  const getReservedNativeTokenBalance = () => {
    if (!senderNativeTokenPublicBalance) {
      return null;
    }
    const conservativeFeeEstimate = Balance.fromBaseUnits(AssetType.Native(config), 0.1);
    const existentialDeposit = Balance.Native(config, AssetType.Native(config).existentialDeposit);
    return conservativeFeeEstimate.add(existentialDeposit);
  };

  // Returns true if the current tx would cause the user to go below a
  // recommended min fee balance of 1. This helps prevent users from
  // accidentally becoming unable to transact because they cannot pay fees
  const txWouldDepleteSuggestedMinFeeBalance = () => {
    if (
      senderAssetCurrentBalance?.assetType.isNativeToken &&
      !senderAssetCurrentBalance?.assetType.isPrivate &&
      senderAssetTargetBalance?.assetType.isNativeToken &&
      !senderAssetTargetBalance?.assetType.isPrivate
    ) {
      const SUGGESTED_MIN_FEE_BALANCE = Balance.fromBaseUnits(AssetType.Native(config), 1);
      const balanceAfterTx = senderAssetCurrentBalance.sub(senderAssetTargetBalance);
      return SUGGESTED_MIN_FEE_BALANCE.gte(balanceAfterTx);
    }
    return false;
  };

  // Checks if the user has enough funds to pay for a transaction
  const userHasSufficientFunds = () => {
    if (!senderAssetTargetBalance || !senderAssetCurrentBalance) {
      return null;
    }
    if (
      senderAssetTargetBalance.assetType.assetId !==
      senderAssetCurrentBalance.assetType.assetId
    ) {
      return null;
    }
    const maxSendableBalance = getMaxSendableBalance();
    return maxSendableBalance.gte(senderAssetTargetBalance);
  };

  // Checks if the user has enough native token to pay fees & publish a transaction
  const userCanPayFee = () => {
    if (!senderNativeTokenPublicBalance || !senderAssetTargetBalance) {
      return null;
    }
    let requiredNativeTokenBalance = getReservedNativeTokenBalance();
    if (senderAssetType.isNativeToken && !senderAssetType.isPrivate) {
      requiredNativeTokenBalance = requiredNativeTokenBalance.add(
        senderAssetTargetBalance
      );
    }
    return senderNativeTokenPublicBalance.gte(requiredNativeTokenBalance);
  };

  // Checks the user is sending at least the existential deposit
  const receiverAmountIsOverExistentialBalance = () => {
    if (!senderAssetTargetBalance) {
      return null;
    }
    return senderAssetTargetBalance.valueAtomicUnits.gte(
      receiverAssetType.existentialDeposit
    );
  };

  // Checks that it is valid to attempt a transaction
  const isValidToSend = () => {
    return (
      (privateWallet.isReady || isPublicTransfer()) &&
      api &&
      externalAccountSigner &&
      receiverAddress &&
      senderAssetTargetBalance &&
      senderAssetCurrentBalance &&
      userHasSufficientFunds() &&
      userCanPayFee() &&
      receiverAmountIsOverExistentialBalance()
    );
  };

  /**
   *
   * Transaction logic
   */

  // Handles the result of a transaction
  const handleTxRes = async ({ status, events }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (api.events.utility.BatchInterrupted.is(event.event)) {
          setTxStatus(TxStatus.failed());
          console.error('Transaction failed', event);
        } else if (api.events.utility.BatchCompleted.is(event.event)) {
          try {
            const signedBlock = await api.rpc.chain.getBlock(status.asInBlock);
            const extrinsics = signedBlock.block.extrinsics;
            const extrinsic = extrinsics.find((extrinsic) =>
              extrinsicWasSentByUser(extrinsic, externalAccount, api)
            );
            const extrinsicHash = extrinsic.hash.toHex();
            setTxStatus(TxStatus.finalized(extrinsicHash));

            // Correct private balances will only appear after a sync has completed
            // Until then, do not display stale balances
            privateWallet.balancesAreStale.current = true;
            senderAssetType.isPrivate && setSenderAssetCurrentBalance(null);
            receiverAssetType.isPrivate && setReceiverCurrentBalance(null);
          } catch(error) {
            console.error(error);
          }
        }
      }
    }
  };

  // Attempts to build and send a transaction
  const send = async () => {
    // @TODO: Add validation for transaction, currently doesnt work because api.query.assets
    // is broken for some reason in the fer/feat/permissionless-asset branch
    /*
    if (!isValidToSend()) {
      console.log("Not valid to send");
      return;
    }
    */
    if (!privateWallet.sdk) {
      console.log("SDK not initialized yet.")
      return;
    }
    setTxStatus(TxStatus.processing());
    try {
      let res;
      if (isPrivateTransfer()) {
        res = await privateTransfer(state);
      } else if (isPublicTransfer()) {
        res = await publicTransfer(state);
      } else if (isToPrivate()) {
        res = await toPrivate(state);
      } else if (isToPublic()) {
        res = await toPublic(state);
      }
      if (res === WASM_WALLET_FAILURE || res === false) {
        console.error('Transaction failed');
        setTxStatus(TxStatus.failed());
        return false;
      }
    } catch (error) {
      console.error('Transaction failed', error);
      setTxStatus(TxStatus.failed());
      return false;
    }
  };

  // Attempts to build and send an internal transaction minting public tokens to private tokens
  const toPrivate = async () => {
    const res = await privateWallet.toPrivateNFT(
      state.senderAssetTargetBalance,
      handleTxRes
    );
    return res;
  };

  // Attempts to build and send an internal transaction reclaiming private tokens to public tokens
  const toPublic = async () => {
    console.log(state.senderAssetTargetBalance);
    const res = await privateWallet.toPublicNFT(
      state.senderAssetTargetBalance,
      handleTxRes
    );
    return res;
  };

  // Attempts to build and send a transaction to some private account
  const privateTransfer = async () => {
    const { senderAssetTargetBalance, receiverAddress } = state;
    console.log(receiverAddress);
    const res = await privateWallet.privateTransferNFT(
      senderAssetTargetBalance,
      receiverAddress,
      handleTxRes
    );
    return res;
  };

  // Attempts to build and send a transaction to some public account
  const publicTransfer = async () => {
    try {
      const { senderAssetTargetBalance, receiverAddress } = state;
      const assetId = senderAssetTargetBalance.assetType.assetId;
      /*
      const valueAtomicUnits = senderAssetTargetBalance.valueAtomicUnits;
      const tx = api.tx.zknft.publicTransfer(
        { id: assetId, value: valueAtomicUnits },
        receiverAddress
      );
      const batchTx = api.tx.utility.batch([tx]);
      const res = await batchTx.signAndSend(externalAccountSigner, handleTxRes);
      */
      const assetIdArray = await privateWallet.sdk.numberToAssetIdArray(parseInt(assetId));
      console.log(assetIdArray);
      const res = await privateWallet.sdk.publicTransferNFT(assetIdArray, receiverAddress);
      setTxStatus(TxStatus.finalized("")); 
      return res;
    } catch (e) {
      console.error(e);
      setTxStatus(TxStatus.failed()); 
    }
  };

  const isToPrivate = () => {
    return !senderAssetType.isPrivate && receiverAssetType.isPrivate;
  };

  const isToPublic = () => {
    return senderAssetType.isPrivate && !receiverAssetType.isPrivate;
  };

  const isPrivateTransfer = () => {
    return senderAssetType.isPrivate && receiverAssetType.isPrivate;
  };

  const isPublicTransfer = () => {
    return !senderAssetType.isPrivate && !receiverAssetType.isPrivate;
  };

  const senderIsPrivate = () => {
    return isPrivateTransfer() || isToPublic();
  };

  const senderIsPublic = () => {
    return isPublicTransfer() || isToPrivate();
  };

  const receiverIsPrivate = () => {
    return isPrivateTransfer() || isToPrivate();
  };

  const receiverIsPublic = () => {
    return isPublicTransfer() || isToPublic();
  };

  const value = {
    userHasSufficientFunds,
    userCanPayFee,
    getMaxSendableBalance,
    receiverAmountIsOverExistentialBalance,
    txWouldDepleteSuggestedMinFeeBalance,
    isValidToSend,
    setSenderAssetTargetBalance,
    setSenderPublicAccount,
    receiverAssetType,
    toggleSenderIsPrivate,
    toggleReceiverIsPrivate,
    setSelectedAssetType,
    setReceiver,
    send,
    isPrivateTransfer,
    isPublicTransfer,
    isToPrivate,
    isToPublic,
    senderIsPrivate,
    receiverIsPrivate,
    senderIsPublic,
    receiverIsPrivate,
    ...state
  };

  return (
    <SendContext.Provider value={value}>{props.children}</SendContext.Provider>
  );
};

SendContextProvider.propTypes = {
  children: PropTypes.any
};

export const useSend = () => ({ ...useContext(SendContext) });
