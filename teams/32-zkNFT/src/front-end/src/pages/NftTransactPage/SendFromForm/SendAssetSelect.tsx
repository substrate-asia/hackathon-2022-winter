// @ts-nocheck
import React from 'react';
import SendAmountInput from './SendAmountInput';
import SendAssetTypeDropdown from './SendAssetTypeDropdown';

const SendAssetSelect = () => {
  return (
    <div className="w-100 relative">
      { /* <SendAssetTypeDropdown /> */ }
      <SendAmountInput />
    </div>
  );
};

export default SendAssetSelect;
