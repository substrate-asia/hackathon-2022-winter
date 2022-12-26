// @ts-nocheck
import React, { useEffect } from 'react';
import { useState } from 'react';
import Select, { components } from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import GradientText from 'components/GradientText';
import { useTxStatus } from 'contexts/txStatusContext';
import classNames from 'classnames';
import {
  validatePrivateAddress,
  validatePublicAddress
} from 'utils/validation/validateAddress';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import BalanceComponent from 'components/Balance';
import { useSubstrate } from 'contexts/substrateContext';
import { useSend } from '../SendContext';

const SendToAddressForm = ({
  internalAccountOptions,
  toReactSelectOption,
  isPrivate
}) => {
  const {
    receiverAddress,
    receiverAssetType,
    setReceiver,
    senderAssetType,
    isPrivateTransfer,
    isPublicTransfer
  } = useSend();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const selectedOption = receiverAddress
    ? toReactSelectOption(receiverAddress)
    : null;

  const [reactSelectExternalOptions, setReactSelectExternalOptions] = useState(
    []
  );
  const reactSelectInternalOptions = internalAccountOptions?.map((address) => {
    return toReactSelectOption(address);
  });

  const optionGroups = [
    {
      label: `External ${
        senderAssetType.isPrivate ? 'Private' : 'Public'
      } Account`,
      options: reactSelectExternalOptions
    },
    {
      label: `My ${
        receiverAssetType.isPrivate ? 'Private' : 'Public'
      } Accounts`,
      options: reactSelectInternalOptions
    }
  ];

  const onChangeOption = (option) => {
    const { value: address } = option;
    setReceiver(address);
    setReactSelectExternalOptions([]);
  };

  const onCloseMenu = () => {
    setMenuIsOpen(false);
    document.activeElement.blur();
  };

  return isPrivateTransfer() || isPublicTransfer() ? (
    <div>
      <SendToAddressInput isPrivate={isPrivate} />
      {isPublicTransfer() && <ReceiverBalanceDisplay />}
    </div>
  ) : (
    <>
      <Select
        className={classNames(
          'flex-grow gradient-border flex items-center h-16',
          'rounded-full p-0.5 text-black dark:text-white'
        )}
        toReactSelectOption={toReactSelectOption}
        setReactSelectExternalOptions={setReactSelectExternalOptions}
        // `react-select` props
        isDisabled={disabled}
        value={selectedOption}
        options={optionGroups}
        onChange={onChangeOption}
        menuIsOpen={menuIsOpen}
        onMenuOpen={() => setMenuIsOpen(true)}
        onMenuClose={onCloseMenu}
        isSearchable={false}
        styles={styles(disabled)}
        placeholder=""
        components={{
          SingleValue: SendToAddressFormSingleValue,
          Option: SendToAddressFormOption,
          IndicatorSeparator: EmptyIndicatorSeparator
        }}
      />
      <ReceiverBalanceDisplay />
    </>
  );
};

const ReceiverBalanceDisplay = () => {
  const {
    receiverAssetType,
    receiverCurrentBalance,
    receiverAddress,
    receiverIsPrivate
  } = useSend();
  const { isInitialSync } = usePrivateWallet();
  const { api } = useSubstrate();

  const shouldShowLoader = receiverAddress && !receiverCurrentBalance && api?.isConnected;
  const shouldShowInitialSync = shouldShowLoader && isInitialSync.current && receiverIsPrivate();
  const balanceString = shouldShowInitialSync
    ? 'Syncing to network' : receiverCurrentBalance?.toString(true);

  return (
    <div className="flex justify-between items-center px-6 py-2">
      <BalanceComponent
        balance={balanceString}
        className="text-black dark:text-white"
        loaderClassName="bg-black dark:bg-white"
        loader={shouldShowLoader}
      />
      <div className="pl-2 border-0 flex items-center gap-3">
        <div>
          <img
            className="w-8 h-8 rounded-full"
            src={receiverAssetType.icon}
            alt="icon"
          />
        </div>
        <GradientText
          className="text-2xl font-bold"
          text={receiverAssetType.ticker}
        />
      </div>
    </div>
  );
};

const SendToAddressInput = ({ isPrivate }) => {
  const { setReceiver } = useSend();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const [errorMessage, setErrorMessage] = useState(null);

  const onChangePrivateInput = (event) => {
    if (event.target.value === '') {
      setErrorMessage(null);
      setReceiver(null);
      return;
    }
    const addressIsValid = validatePrivateAddress(event.target.value);
    if (addressIsValid) {
      setErrorMessage(null);
      setReceiver(event.target.value);
    } else {
      setReceiver(null);
      const addressIsPublic = validatePublicAddress(event.target.value);
      if (addressIsPublic) {
        setErrorMessage('Provided address is public, not private');
      } else {
        setErrorMessage('Invalid address');
      }
    }
  };

  const onChangePublicInput = (event) => {
    if (event.target.value === '') {
      setErrorMessage(null);
      setReceiver(null);
      return;
    }
    const addressIsValid = validatePublicAddress(event.target.value);
    if (addressIsValid) {
      setErrorMessage(null);
      setReceiver(event.target.value);
    } else {
      setReceiver(null);
      const addressIsPrivate = validatePrivateAddress(event.target.value);
      if (addressIsPrivate) {
        setErrorMessage('Provided address is private, not public');
      } else {
        setErrorMessage('Invalid address');
      }
    }
  };

  const onChangeInput = isPrivate ? onChangePrivateInput : onChangePublicInput;

  return (
    <>
      <div
        className={`flex-grow gradient-border ${
          errorMessage && 'error'
        } h-16 rounded-full p-0.5 py-3`}
      >
        <input
          id="recipientAddress"
          className="w-full h-full rounded-full px-5 bg-secondary text-black dark:text-white outline-none"
          onChange={(e) => onChangeInput(e)}
          disabled={disabled}
          placeholder={'address'}
        />
      </div>
      <p
        className={`text-xss text-red-500 ml-2 ${
          errorMessage ? 'visible' : 'invisible'
        }`}
      >
        {errorMessage ?? 'No Error'}
      </p>
    </>
  );
};

const SendToAddressFormSingleValue = (props) => {
  const { data } = props;
  const { label, value } = data;

  const [addressCopied, setAddressCopied] = useState(false);

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(value);
    setAddressCopied(true);
    e.stopPropagation();
    return false;
  };

  useEffect(() => {
    const timer = setTimeout(
      () => addressCopied && setAddressCopied(false),
      2000
    );

    return () => clearTimeout(timer);
  }, [addressCopied]);

  return (
    <div className="pl-4 pr-6 border-0 flex flex-grow items-end gap-2 relative">
      <div className="text-lg text-black dark:text-white">{label}</div>
      <div className="text-xs manta-gray">
        {value.slice(0, 10)}...{value.slice(-10)}
      </div>
      {addressCopied ? (
        <FontAwesomeIcon
          icon={faCheck}
          className="ml-auto cursor-pointer absolute right-1 top-1/2 transform -translate-y-1/2"
        />
      ) : (
        <FontAwesomeIcon
          icon={faCopy}
          className="ml-auto cursor-pointer absolute right-1 top-1/2 transform -translate-y-1/2"
          onMouseDown={(e) => copyToClipboard(e)}
        />
      )}
    </div>
  );
};

const SendToAddressFormOption = (props) => {
  const { value, label, innerProps } = props;
  return (
    <div {...innerProps}>
      <div className="flex items-end hover:bg-blue-100">
        <div className="w-full pl-4 p-2 text-black">
          <components.Option {...props}>{label}</components.Option>
          <div className="text-xs block manta-gray">
            {value.slice(0, 10)}...{value.slice(-10)}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyIndicatorSeparator = () => {
  return <div />;
};

const styles = (disabled) => {
  const cursor = disabled ? 'not-allowed !important' : 'pointer';
  return {
    control: (provided) => ({
      ...provided,
      borderStyle: 'none',
      borderWidth: '0px',
      borderRadius: '100px',
      backgroundColor: 'transparent',
      paddingBottom: '0.5rem',
      paddingTop: '0.5rem',
      boxShadow: '0 0 #0000',
      cursor: cursor,
      width: '100%'
    }),
    dropdownIndicator: () => ({ paddingRight: '1rem' }),
    option: () => ({
      fontSize: '12pt'
    })
  };
};

export default SendToAddressForm;
