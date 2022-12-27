import React, { Suspense } from 'react'
import tw, { styled } from 'twin.macro'
import { useAtomValue } from 'jotai'
import { AnimatePresence, motion } from 'framer-motion'
import { GoPrimitiveDot } from 'react-icons/go'
import {HiOutlineDotsVertical as MenuIcon} from 'react-icons/hi'
import { ButtonGroup, Button, ButtonProps } from '@chakra-ui/react'

import { apiPromiseAtom } from '@/features/parachain/atoms'
import { currentAccountAtom, currentProfileAtom, formatetedAccountBalanceAtom } from '../atoms'

const ConnectStatusDot = styled(GoPrimitiveDot)<{
  connected?: string
}>`
  ${tw`w-4 h-4`}
  ${({ connected }) => !!connected ? tw`text-green-600` : tw`text-gray-600`}
`

const StyledChainName = tw.span`text-gray-300 font-mono text-xs font-extralight ml-1`

const RuntimeChainName = ({ compact }: { compact?: boolean }) => {
  const api = useAtomValue(apiPromiseAtom)
  if (compact) {
    return null
  }
  return (
    <StyledChainName>{api.runtimeChain.toHuman()}</StyledChainName>
  )
}

const EndpointSwitchButton = ({ compact, onClick }: { compact?: boolean, onClick?: React.MouseEventHandler<HTMLButtonElement> }) => {
  return (
    <Button variant="unstyled" tw="flex flex-row items-center pl-3" onClick={onClick}>
      <Suspense
        fallback={
          <>
            <ConnectStatusDot />
            {!compact && (
              <StyledChainName>Disconnected</StyledChainName>
            )}
          </>
        }
      >
        <ConnectStatusDot connected="1" />
        <RuntimeChainName compact={compact} />
      </Suspense>
    </Button>
  )
}

const BalanceMotionContainer = tw(motion.div)`
  font-mono text-sm ml-1 mr-2 overflow-hidden whitespace-nowrap
`

const Balance = () => {
  const [whole, fragction] = useAtomValue(formatetedAccountBalanceAtom)
  if ((whole === null || whole === '0') && fragction === null) {
    return (
      <div tw="hidden xl:block">
        <BalanceMotionContainer initial={{ width: 0 }} animate={{ width: 'auto' }} exit={{ width: 0 }} tw="mx-0">
          <Button
            as="a"
            href="https://docs.phala.world/geting-started/where-to-get-pha-khala-chain" 
            target="_blank"
            rel="noopener noreferer"
            mr="1"
            size="sm"
            rounded="sm"
            color="gray.100"
            bg="transparent"
            _hover={tw`bg-phalaDark text-black`}
          >
            Get PHA
          </Button>
        </BalanceMotionContainer>
      </div>
    )
  }
  return (
    <div tw="hidden xl:block">
      <BalanceMotionContainer initial={{ width: 0 }} animate={{ width: 'auto' }} exit={{ width: 0 }}>
        <big>{whole}</big>
        {fragction !== null && (
          <>
            <span>.</span>
            <small tw="text-gray-400">{fragction}</small>
          </>
        )}
        <span tw="ml-2 text-gray-400">PHA</span>
      </BalanceMotionContainer>
    </div>
  )
}

const CurrentBalance = () => {
  const account = useAtomValue(currentAccountAtom)
  if (!account) {
    return null
  }
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={null}>
        <Balance />
      </Suspense>
    </AnimatePresence>
  )
}

const StyledAccountName = tw(Button)`font-sans`

const DisconnectedAccountName = (props: Omit<ButtonProps, "as">) => {
  const account = useAtomValue(currentAccountAtom)
  return (
    <StyledAccountName {...props} fontSize="sm" h="8">
      <span tw="xl:hidden">
        <MenuIcon />
      </span>
      <span tw="hidden xl:inline-flex">
        {(!account) ? "Connect Wallet" : `${account.name}`}
      </span>
    </StyledAccountName>
  )
}

const CurrentAccountName = (props: Omit<ButtonProps, "as">) => {
  const profile = useAtomValue(currentProfileAtom)
  return (
    <StyledAccountName {...props} fontSize="sm" h="8">
      <span tw="xl:hidden">
        <MenuIcon />
      </span>
      <span tw="hidden xl:inline-flex">
        {(!profile.connected) ? "Connect Wallet" : `${profile.displayName}`}
      </span>
    </StyledAccountName>
  )
}

const StyledButtonGroup = styled.div`
  border-image-slice: 1;
  border-width: 1px;
  border-image-source: linear-gradient(90deg, #2B481E 0%, #233A18 100%);
  border-radius: 2px;
  background: #000;
`

export interface AccessPointComboProps {
  onConnectionStatusClick?: React.MouseEventHandler<HTMLButtonElement>
  onAccountClick: () => void
}

export default function AccessPointCombo({ onConnectionStatusClick, onAccountClick }: AccessPointComboProps) {
  return (
    <ButtonGroup as={StyledButtonGroup}>
      <EndpointSwitchButton compact onClick={onConnectionStatusClick} />
      <div tw="flex flex-row items-center bg-gray-900 h-full p-1 rounded-l-sm">
        <CurrentBalance />
        <Suspense fallback={<DisconnectedAccountName onClick={onAccountClick} />}>
          <CurrentAccountName onClick={onAccountClick} />
        </Suspense>
      </div>
    </ButtonGroup>
  )
}