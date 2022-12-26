// @ts-nocheck
import { usePrivateWallet } from 'contexts/privateWalletContext';
import React from 'react';
import SendToAddressForm from './SendToAddressForm';

const EXTERNAL_ACCOUNT_LABEL = 'External Private Account';

const INTERNAL_ACCOUNT_LABEL = 'Private';

const toReactSelectOption = (address) => {
  if (address) {
    return {
      value: address,
      label: INTERNAL_ACCOUNT_LABEL,
    };
  } else {
    return {
      value: address,
      label: EXTERNAL_ACCOUNT_LABEL,
    };
  }
};

const SendToPrivateAddressForm = () => {
  const { privateAddress } = usePrivateWallet();
  const internalAccountOptions = privateAddress ? [privateAddress] : [];
  return (
    <SendToAddressForm
      receiverAddress={privateAddress}
      internalAccountOptions={internalAccountOptions}
      toReactSelectOption={toReactSelectOption}
      isPrivate={true}
    />
  );
};

export default SendToPrivateAddressForm;
