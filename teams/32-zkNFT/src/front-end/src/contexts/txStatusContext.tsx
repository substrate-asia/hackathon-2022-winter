// @ts-nocheck
import React, { createContext, useState, useContext, useRef } from 'react';
import PropTypes from 'prop-types';

const TxStatusContext = createContext();

export const TxStatusContextProvider = (props) => {
  const [txStatus, _setTxStatus] = useState(null);
  const txStatusRef = useRef(null);

  const setTxStatus = (status) => {
    _setTxStatus(status);
    txStatusRef.current = status;
  };

  const value = {
    txStatus,
    txStatusRef,
    setTxStatus,
  };

  return (
    <TxStatusContext.Provider value={value}>
      {props.children}
    </TxStatusContext.Provider>
  );
};

TxStatusContextProvider.propTypes = {
  children: PropTypes.any,
};

export const useTxStatus = () => ({
  ...useContext(TxStatusContext),
});
