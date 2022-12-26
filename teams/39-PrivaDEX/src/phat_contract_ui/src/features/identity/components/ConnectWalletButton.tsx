import type { PropsWithChildren } from 'react'
import type { WritableAtom } from 'jotai'

import React from 'react'
import { useSetAtom } from 'jotai'
import { Button, ButtonProps } from '@chakra-ui/react'

export interface ConnectWalletButtonProps extends Omit<ButtonProps, "as" | "onClick"> {
  visibleAtom: WritableAtom<boolean, boolean>
}

export default function ConnectWalletButton({ children, visibleAtom, ...props }: PropsWithChildren<ConnectWalletButtonProps>) {
  const setVisible = useSetAtom(visibleAtom)
  return (
    <Button {...props} onClick={() => setVisible(true)}>
      {children || "Connect Wallet"}
    </Button>
  )
}