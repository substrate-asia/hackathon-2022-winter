import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

import { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useToast } from '@chakra-ui/react'
import * as R from 'ramda'

import signAndSend from '@/functions/signAndSend'
import { checkUntil, checkUntilEq } from '@/functions/polling'
import { signerAtom } from '@/features/identity/atoms'
import { apiPromiseAtom, dispatchEventAtom, eventsAtom } from '@/features/parachain/atoms'

import {
  contractSelectedInitSelectorAtom,
  localContractsAtom,
  instantiateTimeoutAtom,
} from '../atoms'

export default function useUploadCodeAndInstantiate() {
  const api = useAtomValue(apiPromiseAtom)
  const signer = useAtomValue(signerAtom)
  const dispatch = useSetAtom(dispatchEventAtom)
  const reset = useResetAtom(eventsAtom)
  const instantiateTimeout = useAtomValue(instantiateTimeoutAtom)
  const toast = useToast()
  const saveContract = useSetAtom(localContractsAtom)
  const chooseInitSelector = useAtomValue(contractSelectedInitSelectorAtom)

  return useCallback(async (account: InjectedAccountWithMeta, contract:ContractMetadata, clusterId: string) => {
    console.group('Instantiate Contract:', clusterId)
    try {
      if (!signer) {
        return false
      }

      // Clear the Event Panel.
      reset()
  
      const salt = '0x' + new Date().getTime()

      if (contract.V3.spec.constructors.length === 0) {
        throw new Error('No constructor found.')
      }
      const defaultInitSelector = R.pipe(
        R.filter((c: ContractMetaConstructor) => c.label === 'default' || c.label === 'new'),
        R.sortBy((c: ContractMetaConstructor) => c.args.length),
        i => R.head<ContractMetaConstructor>(i),
        (i) => i ? i.selector : undefined,
      )(contract.V3.spec.constructors)

      const initSelector = chooseInitSelector || defaultInitSelector
      console.log('user choose initSelector: ', chooseInitSelector)
      console.log('default initSelector: ', defaultInitSelector)
      if (!initSelector) {
        throw new Error('No valid initSelector specified.')
      }
  
      // Upload & instantiate contract
      console.info('Final initSelector: ', initSelector, 'clusterId: ', clusterId)
      const result = await signAndSend(
        api.tx.utility.batchAll([
          api.tx.phalaFatContracts.transferToCluster(
              2e12,  // transfer 2 PHA to the user's cluster wallet, assuming it's enough to pay gas fee
              clusterId,
              account.address,  // user's own account
          ),
          api.tx.phalaFatContracts.clusterUploadResource(clusterId, 'InkCode',contract.source.wasm),
          api.tx.phalaFatContracts.instantiateContract(
            { 'WasmCode': contract.source.hash }, initSelector, salt, clusterId,
            0,  // not transfer any token to the contract during initialization
            1e12,  // a high enough gasLimit to satisfy most of the execution
            null,  // don't put any storageDepositLimit
          ),
        ]),
        account.address,
        signer
      )
      // @ts-ignore
      dispatch(result.events)
      console.log('Uploaded. Wait for the contract to be instantiated...', result)
  
      // @ts-ignore
      const instantiateEvent = R.find(R.pathEq(['event', 'method'], 'Instantiating'), result.events)
      if (instantiateEvent && instantiateEvent.event.data && instantiateEvent.event.data.contract) {
        const contractId = instantiateEvent.event.data.contract
        const metadata = R.dissocPath(['source', 'wasm'], contract)
  
        // Check contracts in cluster or not.
        console.log(`Pooling: Check contracts in cluster (${instantiateTimeout} secs timeout): ${clusterId}`)
        try {
          await checkUntilEq(
            async () => {
              const result = await api.query.phalaFatContracts.clusterContracts(clusterId)
              const contractIds = result.map(i => i.toString())
              return contractIds.filter((id) => id === contractId).length
            },
            1,
            1000 * instantiateTimeout
          )
        } catch (err) {
          throw new Error('Failed to check contract in cluster: may be initialized failed in cluster')
        }

        console.log(`Pooling: ensure contract exists in registry (${instantiateTimeout * 4} secs timeout)`)
        await checkUntil(
          async () => (await api.query.phalaRegistry.contractKeys(contractId)).isSome,
          4 * instantiateTimeout
        )
  
        // Save contract metadata to local storage
        console.log('Save contract metadata to local storage.')
        saveContract(exists => ({ ...exists, [contractId]: {metadata, contractId, savedAt: Date.now()} }))

        console.info('Auto staking to the contract...');
        const stakeResult = await signAndSend(
          api.tx.phalaFatTokenomic.adjustStake(
            contractId,
            1e10,  // stake 1 cent
          ),
          account.address,
          signer
        )
        // @ts-ignore
        dispatch(stakeResult.events)
        console.log('Stake submitted', stakeResult)
  
        toast({
          title: 'Instantiate Requested.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        return contractId
      } else {
        throw new Error('Contract instantiation failed.')
      }
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
  }, [api, dispatch, reset, toast, saveContract, chooseInitSelector, instantiateTimeout])
}
