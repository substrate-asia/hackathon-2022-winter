import tw from 'twin.macro'
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  ButtonGroup,
} from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { RESET } from 'jotai/utils'
import { setCookie } from 'cookies-next'

import { endpointAtom, PARACHAIN_ENDPOINT } from '@/atoms/endpointsAtom'
import { websocketConnectionMachineAtom } from '@/features/parachain/atoms'

export default function EndpointAddressInput({ label }: { label?: string }) {
  const [endpoint, setEndpoint] = useAtom(endpointAtom)
  const [machine, send] = useAtom(websocketConnectionMachineAtom)
  return (
    <FormControl>
      <FormLabel>{label || 'Khala Parachain Endpoint Address'}</FormLabel>
      <InputGroup>
        <Input
          type='url'
          value={endpoint}
          onChange={ev => setEndpoint(ev.target.value)}
        />
        <InputRightElement width="10.5rem">
          <ButtonGroup>
            <Button
              h="1.75rem"
              size="sm"
              disabled={!machine.can('RECONNECT') || machine.context.endpoint === endpoint}
              onClick={() => {
                send({ type: 'RECONNECT', data: { endpoint } })
                setCookie('preferred_endpoint', endpoint, { maxAge: 60 * 60 * 24 * 30 })
              }}
            >
              Connect
            </Button>
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => {
                const endpoint = PARACHAIN_ENDPOINT
                setEndpoint(RESET)
                send({ type: 'RECONNECT', data: { endpoint } })
                setCookie('preferred_endpoint', endpoint, { maxAge: 60 * 60 * 24 * 30 })
              }}
            >
              Reset
            </Button>
          </ButtonGroup>
        </InputRightElement>
      </InputGroup>
    </FormControl>
  )
}
