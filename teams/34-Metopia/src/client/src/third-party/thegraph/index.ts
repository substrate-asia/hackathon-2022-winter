import type { SwapData, WrappedSwapData } from './type'
const apikey = 'ba2bdb8f568023e52452d9ceaa9e865d'

const uniswap_v2 = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
const uniswap_v3 = "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph"
// import { JSONValue, Value, crypto  } from '@graphprotocol/graph-ts'

export async function queryV3SwapHistory(addr: string): Promise<WrappedSwapData> {
    const queryql = `{swaps(orderBy:timestamp orderDirection:desc where:{origin:"${addr}"}){amountUSD timestamp token0{symbol} token1{symbol}}}`
    const load = { query: queryql, variables: null }
    let result = await fetch(uniswap_v3, { method: 'post', body: JSON.stringify(load), mode: 'cors' })
    return result.json()
}

export * from './hooks/usePriceData'
export * from './hooks/useUniswapV3Data'
export { SwapData, WrappedSwapData }
