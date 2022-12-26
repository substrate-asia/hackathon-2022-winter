import type { PropsWithChildren } from 'react'
import type { WritableAtom } from 'jotai'

import React from 'react'
import { useAtom } from 'jotai'
import { Button, ButtonProps } from '@chakra-ui/react'

import { currentAccountAtom } from '../atoms'

export default function ConnectWalletButton({ children, ...props }: PropsWithChildren<Omit<ButtonProps, "as" | "onClick" | "disabled">>) {
  const [currentAccount, setCurrentAccount] = useAtom(currentAccountAtom)
  return (
    <Button {...props} disabled={!currentAccount} onClick={() => setCurrentAccount(null)}>
      {children || "Disconnect"}
    </Button>
  )
}