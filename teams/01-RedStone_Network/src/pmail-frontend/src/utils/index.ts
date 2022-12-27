export const enum TYPES {
  NormalAddr = 'NormalAddr',
  ETHAddr = 'ETHAddr',
  SubAddr = 'SubAddr'
}
export enum TYPES_SHOW_NAME {
  'NormalAddr' = 'web2',
  'gmail' = 'Gmail',
  'qq' = 'qq',
  'ETHAddr' = 'ETH',
  'SubAddr' = 'Substrate'
}
export function getAddressType(address: string): TYPES | null {
  if (/^5\w{47}$/.test(address)) {
    return TYPES.SubAddr
  } else if (/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return TYPES.ETHAddr
  } else if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(address)) {
    return TYPES.NormalAddr
  } else {
    return null
  }
}
export function getMailType(address: string): TYPES_SHOW_NAME | null {
  if (/^\w+([-+.]\w+)*@(\w+([-.]\w+)*)\.\w+([-.]\w+)*$/.test(address)) {
    const execRes = /^\w+([-+.]\w+)*@(\w+([-.]\w+)*)\.\w+([-.]\w+)*$/.exec(address)
    const mailType = execRes?.[2] ?? null
    if (mailType && mailType.toLowerCase() === 'gmail') {
      return TYPES_SHOW_NAME['gmail']
    }
    if (mailType && mailType.toLowerCase() === 'qq') {
      return TYPES_SHOW_NAME['qq']
    }
    return null
  }
  return null
}

