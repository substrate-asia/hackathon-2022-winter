// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useTxStatus } from 'contexts/txStatusContext';
import classNames from 'classnames';
import { useSend } from '../SendContext';

const PublicFromAccountSelect = () => {
  const {
    senderPublicAccount,
    senderPublicAccountOptions,
    setSenderPublicAccount
  } = useSend();

  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();

  const options = senderPublicAccountOptions?.map((account) => {
    return { value: account, label: account.meta.name };
  });

  const selectedOption = senderPublicAccount && {
    value: senderPublicAccount,
    label: senderPublicAccount.meta.name
  };

  const onChangeOption = (option) => {
    if (option.value.address !== senderPublicAccount.address) {
      setSenderPublicAccount(option.value);
    }
  };

  return (
    <Select
      className={classNames(
        'w-100 gradient-border flex items-center h-16',
        'rounded-full p-0.5 text-black dark:text-white',
        {'disabled': disabled})
      }
      isSearchable={false}
      value={selectedOption}
      onChange={onChangeOption}
      options={options}
      placeholder=""
      styles={dropdownStyles(disabled)}
      isDisabled={disabled}
      components={{
        SingleValue: AccountSelectSingleValue,
        Option: AccountSelectOption,
        IndicatorSeparator: EmptyIndicatorSeparator
      }}
      onValueClick={(e) => e.stopPropagation()}
    />
  );
};

const AccountSelectSingleValue = ({ data }) => {
  const [addressCopied, setAddressCopied] = useState(false);

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(data.value.address);
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
      <div className="text-lg text-black dark:text-white">
        {data.value.meta.name}
      </div>
      <div className="text-xs manta-gray">
        {data.value.address.slice(0, 10)}...{data.value.address.slice(-10)}
      </div>
      <data id="clipBoardCopy" value={data.value.address}/>
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

const AccountSelectOption = (props) => {
  const { label, value, innerProps } = props;
  const onClick = () => {
    return;
  };
  return (
    <div {...innerProps}>
      <div className="flex items-center hover:bg-blue-100">
        <div onClick={onClick} className="w-full pl-4 p-2 text-black">
          <components.Option {...props}>{label}</components.Option>
          <div className="text-xs block manta-gray">
            {value.address.slice(0, 10)}...{value.address.slice(-10)}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyIndicatorSeparator = () => {
  return <div />;
};

const dropdownStyles = (disabled) => {
  const cursor = disabled ? 'not-allowed !important' : 'pointer';
  return {
    control: (provided) => ({
      ...provided,
      borderStyle: 'none',
      borderWidth: '0px',
      paddingBottom: '0.5rem',
      paddingTop: '0.5rem',
      boxShadow: '0 0 #0000',
      backgroundColor: 'transparent',
      width: '100%',
      cursor: cursor
    }),
    dropdownIndicator: () => ({ paddingRight: '1rem' }),
    option: () => ({
      fontSize: '12pt'
    }),
    input: (provided) => ({
      ...provided,
      fontSize: '1.125rem',
      paddingLeft: '0.6rem',
      display: 'none',
      minWidth: '0%',
      maxWidth: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      cursor: cursor
    })
  };
};

export default PublicFromAccountSelect;
