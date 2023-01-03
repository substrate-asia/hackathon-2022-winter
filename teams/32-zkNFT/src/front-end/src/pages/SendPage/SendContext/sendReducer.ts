// @ts-nocheck
import { localStorageKeys } from 'constants/LocalStorageConstants';
import store from 'store';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import SEND_ACTIONS from './sendActions';

const getInitialToken = (isPrivate) => {
  return AssetType.AllCurrencies(isPrivate).find(currency => currency.baseTicker === store.get(localStorageKeys.CurrentToken)) ?? AssetType.AllCurrencies(isPrivate)[0];
};

export const SEND_INIT_STATE = {
  senderPublicAccount: null,
  senderPublicAccountOptions: [],

  senderAssetType: getInitialToken(store.get(localStorageKeys.IsPrivateSender, false)),
  senderAssetTypeOptions: AssetType.AllCurrencies(store.get(localStorageKeys.IsPrivateSender, false)),
  senderAssetCurrentBalance: null,
  senderAssetTargetBalance: null,
  senderNativeTokenPublicBalance: null,

  receiverAssetType: getInitialToken(store.get(localStorageKeys.IsPrivateReceiver, true)),
  receiverCurrentBalance: null,
  receiverAddress: null,
};

const sendReducer = (state, action) => {
  switch (action.type) {
  case SEND_ACTIONS.TOGGLE_SENDER_ACCOUNT_IS_PRIVATE:
    return toggleSenderIsPrivate(state);

  case SEND_ACTIONS.TOGGLE_RECEIVER_ACCOUNT_IS_PRIVATE:
    return toggleReceiverIsPrivate(state);

  case SEND_ACTIONS.SET_SELECTED_ASSET_TYPE:
    return setSelectedAssetType(state, action);

  case SEND_ACTIONS.SET_SENDER_PRIVATE_ADDRESS:
    return setSenderPrivateAddress(state, action);

  case SEND_ACTIONS.SET_SENDER_PUBLIC_ACCOUNT:
    return setSenderPublicAccount(state, action);

  case SEND_ACTIONS.SET_SENDER_PUBLIC_ACCOUNT_OPTIONS:
    return setSenderPublicAccountOptions(state, action);

  case SEND_ACTIONS.SET_SENDER_ASSET_CURRENT_BALANCE:
    return setSenderAssetCurrentBalance(state, action);

  case SEND_ACTIONS.SET_SENDER_ASSET_TARGET_BALANCE:
    return setSenderAssetTargetBalance(state, action);

  case SEND_ACTIONS.SET_SENDER_NATIVE_TOKEN_PUBLIC_BALANCE:
    return setSenderNativeTokenPublicBalance(state, action);

  case SEND_ACTIONS.SET_RECEIVER:
    return setReceiver(state, action);

  case SEND_ACTIONS.SET_RECEIVER_CURRENT_BALANCE:
    return setReceiverCurrentBalance(state, action);

  default:
    throw new Error(`Unknown type: ${action.type}`);
  }
};

const getDefaultReceiver = (state, senderIsPrivate, receiverIsPrivate) => {
  if (senderIsPrivate === receiverIsPrivate) {
    return null;
  } else if (!senderIsPrivate && receiverIsPrivate) {
    return state.senderPrivateAddress;
  } else {
    return state.senderPublicAccount?.address;
  }
};

const balanceUpdateIsStale = (stateAssetType, updateAssetType) => {
  if (!updateAssetType) {
    return false;
  }
  if (stateAssetType.assetId === updateAssetType.assetId
    && stateAssetType.isPrivate === updateAssetType.isPrivate
  ) {
    return false;
  }
  return true;
};


const toggleSenderIsPrivate = (state) => {
  const senderAssetType = state.senderAssetType.toggleIsPrivate();
  const senderAssetTypeOptions = AssetType.AllCurrencies(senderAssetType.isPrivate);
  const receiverAddress = getDefaultReceiver(state, senderAssetType.isPrivate, state.receiverAssetType.isPrivate);

  store.set(localStorageKeys.IsPrivateSender, senderAssetType.isPrivate);
  store.set(localStorageKeys.CurrentToken, senderAssetType.baseTicker);

  return {
    ...state,
    senderAssetTypeOptions,
    senderAssetType,
    receiverAddress,
    senderAssetCurrentBalance: null,
  };
};

const toggleReceiverIsPrivate = (state) => {
  const receiverAssetType = state.receiverAssetType.toggleIsPrivate();
  const receiverAddress = getDefaultReceiver(state, state.senderAssetType.isPrivate, receiverAssetType.isPrivate);

  store.set(localStorageKeys.IsPrivateReceiver, receiverAssetType.isPrivate);
  store.set(localStorageKeys.CurrentToken, receiverAssetType.baseTicker);

  return { ...state, receiverAssetType, receiverAddress, receiverCurrentBalance: null };
};

const setSelectedAssetType = (state, action) => {
  store.set(localStorageKeys.CurrentToken, action.selectedAssetType.baseTicker);
  const senderAssetType = action.selectedAssetType;
  let receiverAssetType = senderAssetType;
  if (state.senderAssetType.isPrivate !== state.receiverAssetType.isPrivate) {
    receiverAssetType = senderAssetType.toggleIsPrivate();
  }
  let senderAssetTargetBalance = null;
  if (state.senderAssetTargetBalance) {
    senderAssetTargetBalance = Balance.fromBaseUnits(
      senderAssetType, state.senderAssetTargetBalance.valueBaseUnits()
    );
  }

  return {
    ...state,
    senderAssetCurrentBalance: null,
    receiverCurrentBalance: null,
    senderAssetTargetBalance,
    senderAssetType,
    receiverAssetType
  };
};

const setSenderPrivateAddress = (state, action) => {
  const receiverAddress = getDefaultReceiver(
    state,
    state.senderAssetType.isPrivate,
    state.receiverAssetType.isPrivate
  );

  return {
    ...state,
    receiverAddress,
    senderPrivateAddress: action.senderPrivateAddress
  };
};

const setSenderPublicAccount = (state, action) => {
  return {
    ...state,
    senderAssetCurrentBalance: null,
    senderPublicAccount: action.senderPublicAccount
  };
};

const setSenderPublicAccountOptions = (state, action) => {
  return {
    ...state,
    senderPublicAccountOptions: action.senderPublicAccountOptions
  };
};

const setSenderAssetCurrentBalance = (state, action) => {
  if (balanceUpdateIsStale(state?.senderAssetType, action.senderAssetCurrentBalance?.assetType)) {
    return state;
  }
  return {
    ...state,
    senderAssetCurrentBalance: action.senderAssetCurrentBalance
  };
};

const setSenderAssetTargetBalance = (state, action) => {
  return {
    ...state,
    senderAssetTargetBalance: action.senderAssetTargetBalance
  };
};

const setSenderNativeTokenPublicBalance = (state, action) => {
  return {
    ...state,
    senderNativeTokenPublicBalance: action.senderNativeTokenPublicBalance
  };
};

const setReceiver  = (state, action) => {
  return {
    ...state,
    receiverAddress: action.receiverAddress,
  };
};

const setReceiverCurrentBalance = (state, action) => {
  if (balanceUpdateIsStale(state?.receiverAssetType, action.receiverCurrentBalance?.assetType)) {
    return state;
  }
  return {
    ...state,
    receiverCurrentBalance: action.receiverCurrentBalance
  };
};

export default sendReducer;
