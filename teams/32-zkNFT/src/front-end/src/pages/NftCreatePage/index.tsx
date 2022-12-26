// @ts-nocheck
import NETWORK from 'constants/NetworkConstants';
import React from 'react';
import { TxStatusContextProvider } from 'contexts/txStatusContext';
import { PrivateWalletContextProvider } from 'contexts/privateWalletContext';
import { SubstrateContextProvider } from 'contexts/substrateContext';
import { NFTNavbar } from 'components/Navbar';
import { ExternalAccountContextProvider } from 'contexts/externalAccountContext';
import DeveloperConsole from 'components/Developer/DeveloperConsole';
import { ConfigContextProvider } from 'contexts/configContext';
import NftCreatePageContent from './NftCreatePageContent';
import { NftContextProvider } from 'contexts/nftContext';

// @TODO: Remove dependence of NftContextProvider on PrivateWalletContextProvider `sdk`.

const NftCreatePage = () => {
  return (
    <ConfigContextProvider network={NETWORK.DOLPHIN}>
      <SubstrateContextProvider>
        <ExternalAccountContextProvider>
          <TxStatusContextProvider>
            <PrivateWalletContextProvider>
              <NftContextProvider>
                <div className="min-h-screen">
                  <NFTNavbar />
                  <NftCreatePageContent />
                </div>
                <DeveloperConsole />
              </NftContextProvider>
            </PrivateWalletContextProvider>
          </TxStatusContextProvider>
        </ExternalAccountContextProvider>
      </SubstrateContextProvider>
    </ConfigContextProvider>
  )
}



export default NftCreatePage;