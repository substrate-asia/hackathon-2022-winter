import type {Bytes} from '@polkadot/types-codec'

import { useState, useCallback } from 'react'
import { useAtomValue, useSetAtom } from "jotai"
import { waitForAll } from "jotai/utils"
import { queryClientAtom, atomWithQuery } from 'jotai/query'
import { ContractPromise } from '@polkadot/api-contract'
import { hexToString, stringToHex } from '@polkadot/util'
import { Buffer } from 'buffer'
import * as R from 'ramda'

import { CertificateData, create } from '../../../sdk'
import createLogger from "@/functions/createLogger"
// import { blockBarrier } from '@/functions/polling'
import signAndSend from '@/functions/signAndSend'

import { apiPromiseAtom, dispatchEventAtom } from '@/features/parachain/atoms'
import { currentAccountAtom, signerAtom } from '@/features/identity/atoms'
import { querySignCertificate } from '@/features/identity/queries'
import { queryClusterWorkerPublicKey, queryPinkLoggerContract } from '../queries'

import {
  pruntimeURLAtom,
  currentMethodAtom,
  currentContractAtom,
  dispatchResultsAtom,
  pinkLoggerResultAtom,
  currentSystemContractIdAtom,
  currentClusterIdAtom,
} from '../atoms'

interface InkResponse {
  nonce: string
  result: {
    Ok?: {
      InkMessageReturn: string
    }
  }
}

const debug = createLogger('chain', 'debug')

async function estimateGas(contract: ContractPromise, method: string, cert: CertificateData, args: unknown[]) {
  const { gasRequired, storageDeposit } = await contract.query[method](cert as any, {}, ...args)
  const options = {
      gasLimit: (gasRequired as any).refTime,
      storageDepositLimit: storageDeposit.isCharge ? storageDeposit.asCharge : null
  }
  return options
}

const remotePubkeyAtom = atomWithQuery(get => {
  const api = get(apiPromiseAtom)
  const clusterId = get(currentClusterIdAtom)
  return queryClusterWorkerPublicKey(api, clusterId)
})

// pay 1 PHA as gas fee for each tx call. adhoc but works.
const defaultTxConf = { gasLimit: "1000000000000", storageDepositLimit: null }

export default function useContractExecutor(): [boolean, (inputs: Record<string, unknown>, overrideMethodSpec?: ContractMetaMessage) => Promise<void>] {
  const [api, pruntimeURL, selectedMethodSpec, contract, account, queryClient, signer] = useAtomValue(waitForAll([
    apiPromiseAtom,
    pruntimeURLAtom,
    currentMethodAtom,
    currentContractAtom,
    currentAccountAtom,
    queryClientAtom,
    signerAtom,
  ]))
  const data = useAtomValue(remotePubkeyAtom)
  const remotePubkey = R.path([0,1,0], data) as string
  const systemContractId = useAtomValue(currentSystemContractIdAtom)
  const appendResult = useSetAtom(dispatchResultsAtom)
  const dispatch = useSetAtom(dispatchEventAtom)
  const setLogs = useSetAtom(pinkLoggerResultAtom)
  const [isLoading, setIsLoading] = useState(false)

  const fn = useCallback(async (inputs: Record<string, unknown>, overrideMethodSpec?: ContractMetaMessage) => {
    setIsLoading(true)
    const methodSpec = overrideMethodSpec || selectedMethodSpec
    try {
      if (!api || !account || !methodSpec || !signer) {
        debug('contractInstance or account is null')
        return
      }
      console.log('contract', contract)
      const apiCopy = await api.clone().isReady
      const contractInstance = new ContractPromise(
        (await create({
          api: apiCopy, baseURL: pruntimeURL, contractId: contract.contractId, remotePubkey: remotePubkey,
          // enable autoDeposit to pay for gas fee
          autoDeposit: true
        })).api,
        contract.metadata,
        contract.contractId
      )
      debug('methodSpec', methodSpec)

      const queryMethods = R.fromPairs(R.map(
        i => [i.meta.identifier, i.meta.method],
        R.values(contractInstance.query || {})
      ))
      const txMethods = R.fromPairs(R.map(
        i => [i.meta.identifier, i.meta.method],
        R.values(contractInstance.tx || {})
      ))
      // debug('queryMethods', queryMethods)
      // debug('txMethods', txMethods)

      if (!queryMethods[methodSpec.label] && !txMethods[methodSpec.label]) {
        debug('method not found', methodSpec.label)
        return
      }
      const args = R.map(
        i => {
          const value = inputs[i.label]
          if (i.type.type === 1 && typeof value === 'string') {
            return [value]
          }
          return value
        },
        methodSpec.args
      )
      debug('args built: ', args)

      // The certificate is used in query and for gas estimation in tx.
      const cert = await queryClient.fetchQuery(querySignCertificate(api, signer, account))

      // tx
      if (methodSpec.mutates) {
        // const { signer } = await web3FromSource(account.meta.source)
        const txConf = await estimateGas(contractInstance, txMethods[methodSpec.label], cert, args);
        const r1 = await signAndSend(
          contractInstance.tx[txMethods[methodSpec.label]](txConf, ...args),
          account.address,
          signer
        )
        // @ts-ignore
        dispatch(r1.events)
        debug('result: ', r1)
        // 2022-11-01: temporary disable block barrier since that's not required for all cases.
        // const prpc = await createPruntimeApi(pruntimeURL)
        // const prpc = createPruntimeApi(pruntimeURL)
        // console.log('prpc', prpc)
        // await blockBarrier(contractInstance.api, prpc)
      }
      // query
      else {
        const queryResult = await contractInstance.query[queryMethods[methodSpec.label]](
          // @FIXME this is a hack to make the ts compiler happy.
          cert as unknown as string,
          // querySignCache as unknown as string,
          { value: 0, gasLimit: -1 },
          ...args
        )
        // debug('query result: ', queryResult)
        // @TODO Error handling
        if (queryResult.result.isOk) {
          appendResult({
            contract,
            methodSpec,
            succeed: true,
            args: inputs,
            output: queryResult.output?.toHuman(),
            completedAt: Date.now(),
          })
        } else {
          appendResult({
            contract,
            methodSpec,
            succeed: false,
            args: inputs,
            output: queryResult.result.toHuman(),
            completedAt: Date.now(),
          })
        }
      }
    } finally {
      if (api && signer && account && systemContractId) {
        try {
          const cert = await queryClient.fetchQuery(querySignCertificate(api, signer, account))
          const result = await queryClient.fetchQuery(queryPinkLoggerContract(api, pruntimeURL, cert, systemContractId, remotePubkey))
          if (result) {
            const { sidevmQuery } = result
            const params = {
              action: 'GetLog',
              contract: contract.contractId,
            }
            const raw = await sidevmQuery(stringToHex(JSON.stringify(params)) as unknown as Bytes, cert)
            const resp = api.createType('InkResponse', raw).toHuman() as unknown as InkResponse
            if (resp.result.Ok) {
              const response: PinkLoggerResposne = JSON.parse(resp.result.Ok.InkMessageReturn)
              response.records.forEach(r => {
                if (r.type == 'MessageOutput' && r.output.startsWith('0x')) {
                  try {
                    let decoded = api.createType('Result<ExecReturnValue, DispatchError>', r.output)
                    r.decoded = JSON.stringify(decoded.toHuman())
                  } catch {
                    console.info('Failed to decode MessageOutput', r.output)
                  }
                }
              })
              // console.log('response', response.records[0].output)
              // const lines = hexToString(resp.result.Ok.InkMessageReturn).trim().split('\n')
              setLogs(R.reverse(response.records))
            }
          }
        } catch (err) {
          console.error('PinkLogger failed: ', err)
        }
      }
      setIsLoading(false)
    }
  }, [
    api, pruntimeURL, contract, account, selectedMethodSpec, appendResult, dispatch, queryClient,
    signer, setLogs, systemContractId
  ])
  return [isLoading, fn]
}