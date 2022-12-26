export const enum TYPES {
  NormalAddr = 'NormalAddr',
  ETHAddr = 'ETHAddr',
  SubAddr = 'SubAddr'
}
export function getAddressType(address: string): TYPES | null {
  if (/^5\w{47}$/.test(address)) {
    return TYPES.SubAddr
  } else if (/^0x[0-9a-f]{40}$/.test(address)) {
    return TYPES.ETHAddr
  } else if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(address)) {
    return TYPES.NormalAddr
  } else {
    return null
  }
}
