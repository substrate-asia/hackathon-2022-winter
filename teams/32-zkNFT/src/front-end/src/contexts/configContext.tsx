// @ts-nocheck
import NETWORK from 'constants/NetworkConstants';
import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { dolphinConfig, calamariConfig } from 'config';

const ConfigContext = createContext();

export const ConfigContextProvider = ({children, network}) => {
  let config;
  if (network === NETWORK.CALAMARI) {
    config = calamariConfig;
  } else if (network === NETWORK.DOLPHIN) {
    config = dolphinConfig;
  }
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

ConfigContextProvider.propTypes = {
  children: PropTypes.any,
  network: PropTypes.string
};

export const useConfig = () => ({
  ...useContext(ConfigContext),
});
