import useSWR from "swr";
import { useWallet } from "../../../config/redux";
import type { WrappedSwapData } from '../type';
const uniswap_v3_url = "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph"

const fetcher = (url, address) => {
    let queryql = `{swaps(orderBy:timestamp orderDirection:desc where:{origin:"${address}"}){amountUSD amount0 amount1 timestamp token0{symbol} token1{symbol}}}`
    const load = { query: queryql, variables: null }
    return fetch(url, {
        method: 'post',
        body: JSON.stringify(load),
        mode: 'cors'
    }).then((res) => res.json())
}

export const useUniswapV3Data = (address?: string): {
    data: WrappedSwapData;
    error: any;
} => {

    const [wallet] = useWallet()
    const account = wallet?.address

    const { data, error } = useSWR(
        address || account ? [uniswap_v3_url, address || account] : null,
        fetcher,
        {
            refreshInterval: 0,
            revalidateOnFocus: false
        })
    return { data, error }
}

// export default useUniswapV3Data