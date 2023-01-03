import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

import { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useToast } from '@chakra-ui/react'
import * as R from 'ramda'

import { apiPromiseAtom, dispatchEventAtom, eventsAtom } from '@/features/parachain/atoms'

import {
  localContractsAtom,
} from '../atoms'

export default function useAttachToContract() {
  const api = useAtomValue(apiPromiseAtom)
  // const signer = useAtomValue(signerAtom)
  const dispatch = useSetAtom(dispatchEventAtom)
  const reset = useResetAtom(eventsAtom)
  // const instantiateTimeout = useAtomValue(instantiateTimeoutAtom)
  const toast = useToast()
  const saveContract = useSetAtom(localContractsAtom)

  return useCallback(async (contract: ContractMetadata, clusterId: string, contractId: string) => {
    console.group('Attach to Contract:', contractId)
    try {
      // Clear the Event Panel.
      reset()
      
      const metadata = R.dissocPath(['source', 'wasm'], contract)

      // Check contracts in cluster or not.
      const result = await api.query.phalaFatContracts.clusterContracts(clusterId)
      const contractIds = result.map(i => i.toString())
      const contractsFound = contractIds.filter((id) => id === contractId).length
      if (!contractsFound) {
        throw new Error('Contract not found on the blockchain.')
      }

      // Check contract key available
      const keyAvailable = (await api.query.phalaRegistry.contractKeys(contractId)).isSome
      if (!keyAvailable) {
        throw new Error('Contract key not available on the blockchain.')
      }

      // Save contract metadata to local storage
      console.log('Save contract metadata to local storage.')
      saveContract(exists => ({ ...exists, [contractId as any]: {metadata, contractId, savedAt: Date.now()} }))

      toast({
        title: 'Contract Attached.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      return true
    } catch (err) {
      console.error(err)
      toast({
        title: `${err}`,
        status: 'error',
        isClosable: true,
      })
    } finally {
      console.groupEnd()
    }
  }, [api, dispatch, reset, toast, saveContract])
}
