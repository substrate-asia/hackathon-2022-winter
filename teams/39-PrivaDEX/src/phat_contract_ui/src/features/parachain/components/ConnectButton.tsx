import { Button } from '@chakra-ui/react'
import { useAtom } from 'jotai'

import { websocketConnectionMachineAtom } from '@/features/parachain/atoms'

export default function ConnectButton() {
  const [machine, send] = useAtom(websocketConnectionMachineAtom)
  return (
    <Button
      disabled={!machine.can('CONNECT')}
      onClick={() => send({ type: 'CONNECT' })}
    >
      Connect
    </Button>
  )
}
