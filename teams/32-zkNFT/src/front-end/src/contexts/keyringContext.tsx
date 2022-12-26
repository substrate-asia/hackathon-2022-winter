// @ts-nocheck
import APP_NAME from 'constants/AppConstants';
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import uiKeyring from '@polkadot/ui-keyring';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { useConfig } from './configContext';

const KeyringContext = createContext();

export const KeyringContextProvider = (props) => {
  const config = useConfig();
  const [keyring, setKeyring] = useState(null);

  useEffect(() => {
    const extensionIsInjected = () => {
      return !!window.injectedWeb3['polkadot-js'] || !!window.injectedWeb3['talisman'];
    };

    const initKeyring = async () => {
      await web3Enable(APP_NAME);
      let allAccounts = await web3Accounts();
      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: meta.name },
      }));
      uiKeyring.loadAll(
        {
          ss58Format: config.SS58_FORMAT,
          isDevelopment: config.DEVELOPMENT_KEYRING
        },
        allAccounts,
      );
      setKeyring(uiKeyring);
    };

    const initKeyringWhenInjected = async () => {
      if (extensionIsInjected()) {
        await initKeyring();
      } else {
        setTimeout(async () => {
          if (!extensionIsInjected()) {
            setKeyring(false);
          } else if (!keyring) {
            await initKeyring();
          }
        }, 500);
      }
    };
    if (keyring) return;
    initKeyringWhenInjected();
  }, [keyring]);



  const value = {
    keyring: keyring
  };

  return (
    <KeyringContext.Provider value={value}>
      {props.children}
    </KeyringContext.Provider>
  );
};

KeyringContextProvider.propTypes = {
  children: PropTypes.any
};

export const useKeyring = () => ({ ...useContext(KeyringContext) });
