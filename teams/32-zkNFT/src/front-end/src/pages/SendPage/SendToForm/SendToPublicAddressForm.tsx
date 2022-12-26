// @ts-nocheck
import React from 'react';
import { useSend } from '../SendContext';
import SendToAddressForm from './SendToAddressForm';

const _toReactSelectOption = (accountOptions) => {
  return (address) => {
    const option = accountOptions?.find(option => option.address === address);
    const label =  option?.meta.name;
    return {
      value: address,
      label,
    };
  };
};

const SendToPublicAddressForm = () => {
  const {
    senderPublicAccountOptions
  } = useSend();
  const toReactSelectOption = _toReactSelectOption(senderPublicAccountOptions);

  return (
    <SendToAddressForm
      internalAccountOptions={senderPublicAccountOptions.map(option => option.address)}
      toReactSelectOption={toReactSelectOption}
      isPrivate={false}
    />
  );
};

export default SendToPublicAddressForm;
