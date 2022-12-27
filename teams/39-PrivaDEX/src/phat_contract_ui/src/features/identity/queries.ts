import type { ApiPromise } from "@polkadot/api"
import type { InjectedAccountWithMeta, InjectedAccount } from '@polkadot/extension-inject/types'
import type { Signer } from "@polkadot/types/types"
import type {Signer as InjectedSigner} from '@polkadot/api/types'

import type { QueryFunctionContext } from "@tanstack/query-core"

import { signCertificate } from '../../sdk'

const hexToUtf8 = (hex: string): string => {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2)
  }
  return decodeURIComponent(hex.replace(/[0-9a-f]{2}/g, '%$&'))
}

export function queryChainIdentity(api: ApiPromise, address: string) {
  return {
    queryKey: ['onChainIdentity', address],
    queryFn: async (ctx: any) => {
      const {queryKey: [, address]} = ctx as QueryFunctionContext<[string, string]>
      const result = await api.query.identity.identityOf(address)
      if (result.isSome) {
        const raw = result.unwrap().toJSON() as {info: {display: {raw: string}}}
        return {
          displayName: hexToUtf8(raw.info.display.raw)
        }
      }
      return {
        displayName: null,
      }
    }
  }
}

export function querySignCertificate(api: ApiPromise, signer: Signer | InjectedSigner, account: InjectedAccountWithMeta) {
  return {
    queryKey: ['queryContractCert', account.address],
    queryFn: () => signCertificate({ signer, account, api }),
    staleTime: 1000 * 60 * 15, // 15 minutes
  }
}
