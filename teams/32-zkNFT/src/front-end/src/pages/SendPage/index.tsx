// @ts-nocheck
import NETWORK from 'constants/NetworkConstants';
import React from 'react';
import { TxStatusContextProvider } from 'contexts/txStatusContext';
import { PrivateWalletContextProvider } from 'contexts/privateWalletContext';
import { SubstrateContextProvider } from 'contexts/substrateContext';
import { DolphinNavbar } from 'components/Navbar';
import { ExternalAccountContextProvider } from 'contexts/externalAccountContext';
import DeveloperConsole from 'components/Developer/DeveloperConsole';
import { ConfigContextProvider } from 'contexts/configContext';
import { SendContextProvider } from './SendContext';
import SendPageContent from './SendPageContent';

const SendPage = () => {
  return (
    <ConfigContextProvider network={NETWORK.DOLPHIN}>
      <SubstrateContextProvider>
        <ExternalAccountContextProvider>
          <TxStatusContextProvider >
            <PrivateWalletContextProvider>
              <SendContextProvider>
                <div className="min-h-screen">
                  <DolphinNavbar />
                  <SendPageContent />
                </div>
                <DeveloperConsole />
              </SendContextProvider>
            </PrivateWalletContextProvider>
          </TxStatusContextProvider>
        </ExternalAccountContextProvider>
      </SubstrateContextProvider>
    </ConfigContextProvider>
  );
};

export default SendPage;
