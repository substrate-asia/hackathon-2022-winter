import { Keyring } from '@polkadot/api'
import { decodeAddress } from '@polkadot/util-crypto'
import * as E from 'fp-ts/Either'

/**
 * The full list of prefix can found here:
 * https://github.com/paritytech/ss58-registry/blob/main/ss58-registry.json
 * 
 * For PhalaWorld, we use SubStrate so we also convert address to Substrate format. 
 */
export function checkFormat(address: string, prefix: number = 30) {
  try {
    const account = decodeAddress(address)
    const keyring = new Keyring()
    const encoded = keyring.encodeAddress(account, prefix)
    return E.right(encoded)
  } catch (error) {
    return E.left(error)
  }
}