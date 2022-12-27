// import type { FoundationProviderProps } from '@/foundation/Provider'

import { Outlet } from "@tanstack/react-location"

import FoundationProvider from '@/foundation/Provider'
import { AppUI, AppHeader, AppContainer } from '@/components/app-ui'
import StatusBar from '@/components/StatusBar'

import ContractAddPage from '@/pages/contract-add-page'
import ContractAttachPage from '@/pages/contract-attach-page'
import ContractListPage from '@/pages/contract-list-page'
import ContractInfoPage from '@/pages/contract-info-page'
import ComponentListPage from '@/pages/component-list-page'

// const endpoint = 'wss://poc5.phala.network/ws';
// const endpoint = 'ws://localhost:9944';
// const endpoint = 'wss://rococo-canvas-rpc.polkadot.io';

// const initialValues: FoundationProviderProps["initialValues"] = [
//   [rpcEndpointAtom, endpoint],
// ]

export default function PhalaContractsUI() {
  return (
    <FoundationProvider
      // initialValues={initialValues}
      routes={[
        { path: "/", element: <ContractListPage /> },
        { path: "/contracts/add", element: <ContractAddPage /> },
        { path: "/contracts/attach", element: <ContractAttachPage /> },
        { path: "/contracts/view/:contractId", element: <ContractInfoPage /> },
        { path: "/components", element: <ComponentListPage /> },
      ]}
    >
      <AppUI>
        <AppHeader
          title="Phat Contract UI"
        />
        <AppContainer>
          <Outlet />
        </AppContainer>
        <StatusBar />
      </AppUI>
    </FoundationProvider>
  )
}
