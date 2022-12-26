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
import { NftContextProvider } from 'contexts/nftContext';
import NftPageContent from './NftPageContent';
import { SendContextProvider } from '../NftTransactPage/SendContext';

const NftPage = () => {

  return (
    <ConfigContextProvider network={NETWORK.DOLPHIN}>
      <SubstrateContextProvider>
        <ExternalAccountContextProvider>
          <TxStatusContextProvider>
            <PrivateWalletContextProvider>
              <NftContextProvider>
                <SendContextProvider>
                  <div className="min-h-screen">
                    <NFTNavbar />
                    <NftPageContent />
                  </div>
                  <DeveloperConsole />
                </SendContextProvider>
              </NftContextProvider>
            </PrivateWalletContextProvider>
          </TxStatusContextProvider>
        </ExternalAccountContextProvider>
      </SubstrateContextProvider>
    </ConfigContextProvider>
  )
}



export default NftPage;