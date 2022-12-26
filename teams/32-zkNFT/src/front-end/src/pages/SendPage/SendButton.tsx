// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import MantaLoading from 'components/Loading';
import { useTxStatus } from 'contexts/txStatusContext';
import { showError } from 'utils/ui/Notifications';
import Balance from 'types/Balance';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useSend } from './SendContext';

const SendButton = () => {
  const {
    isToPrivate,
    isToPublic,
    isPublicTransfer,
    isPrivateTransfer,
    userCanPayFee,
    receiverAssetType,
    receiverAmountIsOverExistentialBalance
  } = useSend();
  const { signerIsConnected } = usePrivateWallet();
  const { txStatus } = useTxStatus();
  const { send } = useSend();
  const disabled = txStatus?.isProcessing();

  const onClick = () => {
    if (!signerIsConnected) {
      showError('Signer must be connected');
    } else if (receiverAmountIsOverExistentialBalance() === false) {
      const existentialDeposit = new Balance(
        receiverAssetType,
        receiverAssetType.existentialDeposit
      );
      showError(
        `Minimum ${
          receiverAssetType.ticker
        } transaction is ${existentialDeposit.toString()}`
      );
    } else if (userCanPayFee() === false) {
      showError('Cannot pay transaction fee; deposit DOL to transact');
    } else if (!disabled) {
      send();
    }
  };

  let buttonLabel;
  if (isToPrivate()) {
    buttonLabel = 'To Private';
  } else if (isToPublic()) {
    buttonLabel = 'To Public';
  } else if (isPublicTransfer()) {
    buttonLabel = 'Public Transfer';
  } else if (isPrivateTransfer()) {
    buttonLabel = 'Private Transfer';
  }

  return (
    <div>
      {txStatus?.isProcessing() ? (
        <MantaLoading className="py-4" />
      ) : (
        <button
          id="sendButton"
          onClick={onClick}
          className={classNames(
            'py-3 cursor-pointer text-xl btn-hover unselectable-text',
            'text-center rounded-full btn-primary w-full',
            { disabled: disabled }
          )}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default SendButton;
