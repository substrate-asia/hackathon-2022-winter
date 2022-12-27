import { Button } from '@chakra-ui/react'
import { useAtom } from 'jotai'

import { websocketConnectionMachineAtom } from '@/features/parachain/atoms'

export default function DisconnectButton() {
  const [machine, send] = useAtom(websocketConnectionMachineAtom)
  return (
    <Button
      disabled={!machine.can('DISCONNECT')}
      onClick={() => send({ type: 'DISCONNECT' })}
    >
      Disconnect
    </Button>
  )
}
