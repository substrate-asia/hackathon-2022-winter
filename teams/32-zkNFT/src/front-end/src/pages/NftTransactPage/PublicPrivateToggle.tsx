// @ts-nocheck
import classNames from 'classnames';
import { useTxStatus } from 'contexts/txStatusContext';
import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as SunIcon } from 'resources/icons/sun.svg';
import { ReactComponent as ShieldIcon } from 'resources/icons/shield-lock.svg';

const PublicPrivateToggle = ({ isPrivate, onToggle, label, prefix }) => {
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();

  const onClick = () => {
    !disabled && onToggle();
  };

  let buttonId;
  if (isPrivate) {
    buttonId = `${prefix}PrivateTogglePublic`;
  } else {
    buttonId = `${prefix}PublicTogglePrivate`;
  }

  return (
    <div className="flex justify-center items-center h-11">
      <label className="text-primary">{label}</label>
      <span
        id={buttonId}
        onClick={onClick}
        className={classNames(
          'py-2 pr-1 cursor-pointer btn-hover unselectable-text',
          'text-center rounded-full btn-primary flex items-center justify-center gap-1 w-28 text-white',
          { disabled: disabled }
        )}
      >
        {isPrivate ? (
          <>
            <ShieldIcon />
            Private
          </>
        ) : (
          <>
            <SunIcon />
            Public
          </>
        )}
      </span>
    </div>
  );
};

PublicPrivateToggle.propTypes = {
  isPrivate: PropTypes.bool,
  onToggle: PropTypes.func,
  label: PropTypes.string,
  prefix: PropTypes.string
};

export default PublicPrivateToggle;
