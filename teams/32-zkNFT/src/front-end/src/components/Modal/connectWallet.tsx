import React from 'react';
import Svgs from 'resources/icons';
import PolkadotIcon from 'resources/icons/chain/polkadot.svg';

const ConnectWalletModal = () => {
  return (
    <div className="p-4 w-96">
      <h1 className="text-black dark:text-white text-xl">Connect wallet</h1>
      <a
        href="https://talisman.xyz/"
        target="_blank"
        className="mt-6 p-4 text-black dark:text-white flex items-center justify-between border border-manta-gray text-secondary rounded-xl w-full block" rel="noreferrer"
      >
        Talisman
        <img src={Svgs.Talisman} alt="Talisman" className="w-8 h-8" />
      </a>
      <a
        href="https://polkadot.js.org/extension/"
        target="_blank"
        className="mt-6 p-4 text-black dark:text-white flex items-center justify-between border border-manta-gray text-secondary rounded-xl w-full block" rel="noreferrer"
      >
        Polkadot
        <img src={PolkadotIcon} alt="Polkadot" className="w-8 h-8" />
      </a>
      <div className="text-center text-sm text-secondary mt-6">
        New to Polkadot?
      </div>
      <a
        href="https://support.polkadot.network/support/solutions/articles/65000068702-where-to-store-dot-polkadot-wallet-options"
        target="_blank"
        className="text-center text-link block mt-6"
        rel="noreferrer"
      >
        Learn more about wallets
      </a>
    </div>
  );
};

export default ConnectWalletModal;
