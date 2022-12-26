// @ts-nocheck
// This component will simply add utility functions to your developer console.
import { useEffect } from 'react';
import { useSubstrate } from 'contexts/substrateContext';
import { useKeyring } from 'contexts/keyringContext';
import { useConfig } from 'contexts/configContext';

export default function DeveloperConsole() {
  const { api, apiState } = useSubstrate();
  const { keyring } = useKeyring();
  const config = useConfig();

  if (!config.DEV_CONSOLE) {
    return;
  }

  useEffect(() => {
    if (keyring) {
      window.keyring = keyring;
    }
  }, [keyring]);

  if (apiState === 'READY') {
    window.api = api;
  }

  if (keyring) {
    window.keyring = keyring;
  }
  window.util = require('@polkadot/util');
  window.utilCrypto = require('@polkadot/util-crypto');

  return null;
}
