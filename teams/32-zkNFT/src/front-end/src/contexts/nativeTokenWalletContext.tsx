// @ts-nocheck
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef
} from 'react';
import { BN } from 'bn.js';
import Balance from 'types/Balance';
import PropTypes from 'prop-types';
import { useSubstrate } from './substrateContext';
import { useExternalAccount } from './externalAccountContext';
import { useConfig } from './configContext';

const NativeTokenWalletContext = createContext();

export const NativeTokenWalletContextProvider = (props) => {
  const config = useConfig();
  const { api } = useSubstrate();
  const { externalAccount, externalAccountRef } = useExternalAccount();
  const [nativeTokenBalance, setNativeTokenBalance] = useState(null);
  const refreshLoopIsActive = useRef(false);

  useEffect(() => {
    const refreshNativeTokenBalance = async () => {
      const spendableBalanceAmount = await api.query.system.account(
        externalAccountRef.current.address
      );
      setNativeTokenBalance(
        Balance.Native(config, new BN(spendableBalanceAmount.data.free.toString()))
      );
    };
    const refreshNativeTokenBalanceLoop = async () => {
      if (!api || !externalAccount) {
        setNativeTokenBalance(null);
        // refresh on change account
      } else if (refreshLoopIsActive.current === true) {
        refreshNativeTokenBalance();
        // refresh on new block
      } else {
        refreshLoopIsActive.current = true;
        api.rpc.chain.subscribeNewHeads(async () => {
          refreshNativeTokenBalance();
        });
      }
    };
    refreshNativeTokenBalanceLoop();
  }, [api, externalAccount]);

  const getTransactionFee = async (transaction) => {
    const paymentInfo = await transaction.paymentInfo(externalAccount);
    const feeAmount = new BN(paymentInfo.partialFee.toString());
    return Balance.Native(config, feeAmount);
  };

  const getUserCanPayFeeForNativeTokenTransfer = async (transaction) => {
    const fee = await getTransactionFee(transaction);
    const transferAmount = Balance.Native(config, new BN(transaction.args[1].toString()));
    return fee.lt(nativeTokenBalance.sub(transferAmount));
  };

  const getUserCanPayFee = async (transaction) => {
    if (nativeTokenBalance === null || !api) {
      return false;
    }
    const NATIVE_TOKEN_TRANSFER_EXTRINSIC_NAME = 'transfer';
    if (
      transaction.method.meta.name.toString() ===
      NATIVE_TOKEN_TRANSFER_EXTRINSIC_NAME
    ) {
      return getUserCanPayFeeForNativeTokenTransfer(transaction);
    }
    const fee = await getTransactionFee(transaction);
    return fee.lt(nativeTokenBalance);
  };

  const value = {
    nativeTokenBalance: nativeTokenBalance,
    getUserCanPayFee: getUserCanPayFee
  };

  return (
    <NativeTokenWalletContext.Provider value={value}>
      {props.children}
    </NativeTokenWalletContext.Provider>
  );
};

NativeTokenWalletContextProvider.propTypes = {
  children: PropTypes.any
};

export const useNativeTokenWallet = () => ({
  ...useContext(NativeTokenWalletContext)
});
