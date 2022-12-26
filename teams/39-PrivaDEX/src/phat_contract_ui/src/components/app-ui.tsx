import { FC, ReactNode } from 'react'

import React, { useCallback } from 'react'
import { Link } from "@tanstack/react-location"
import tw, { styled } from 'twin.macro'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useAutoConnect } from '@/features/parachain/atoms'
import { lastSelectedWeb3ProviderAtom, useRestoreLastSelectedAccount } from '@/features/identity/atoms'
import AccessPointCombo from '@/features/identity/components/AccessPointCombo'
import { WalletSelectModal, AccountSelectModal } from '@/features/identity/components/AccountSelectModal'
import EndpointInfoModal, { connectionDetailModalVisibleAtom } from './EndpointInfo'
import Logo from './Logo'

export const walletSelectModalVisibleAtom = atom(false) 

export const accountSelectModalVisibleAtom = atom(false)

export const useShowAccountSelectModal = () => {
  const setWalletSelectModalVisible = useSetAtom(walletSelectModalVisibleAtom)
  const setAccountSelectModalVisible = useSetAtom(accountSelectModalVisibleAtom)
  const currentProvider = useAtomValue(lastSelectedWeb3ProviderAtom)
  return useCallback(() => {
    if (currentProvider) {
      setAccountSelectModalVisible(true)
    } else {
      setWalletSelectModalVisible(true)
    }
  }, [setWalletSelectModalVisible, setAccountSelectModalVisible, currentProvider])
}

export const AppUI = styled.div`
  ${tw`flex flex-col max-h-full h-full overflow-y-hidden`}
  justify-content: safe center;
`

export const AppHeader: FC<{
  title?: string
  left?: ReactNode
}> = ({ title = 'PHALA', left }) => {
  useRestoreLastSelectedAccount()
  useAutoConnect()
  const showAccountSelectModal = useShowAccountSelectModal()
  const setEndpointInfoVisible = useSetAtom(connectionDetailModalVisibleAtom)
  return (
    <div tw="bg-black py-2">
      <header tw="mx-auto w-full max-w-7xl md:flex md:items-center md:justify-between py-2">
        <div tw="flex-1 min-w-0">
          {left ? left : (
            <h2 tw="text-2xl font-bold leading-7 text-white font-heading">
              <Link tw="text-phala-500" to="/" title={title}>
                <Logo />
              </Link>
            </h2>
          )}
        </div>
        <div tw="mt-4 flex flex-row items-center justify-center gap-1 md:mt-0 md:ml-4">
          <AccessPointCombo onAccountClick={showAccountSelectModal} onConnectionStatusClick={() => setEndpointInfoVisible(true)} />
        </div>
      </header>
      <WalletSelectModal visibleAtom={walletSelectModalVisibleAtom} accountSelectModalVisibleAtom={accountSelectModalVisibleAtom} />
      <AccountSelectModal visibleAtom={accountSelectModalVisibleAtom} walletSelectModalVisibleAtom={walletSelectModalVisibleAtom} />
      <EndpointInfoModal />
    </div>
  )
}

export const AppContainer: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div css={tw`
      py-8
      flex-grow
      flex-col items-start justify-start
      overflow-y-scroll
    `}>
      <div tw='mx-auto w-full max-w-7xl'>
        {children}
      </div>
    </div>
  )
}