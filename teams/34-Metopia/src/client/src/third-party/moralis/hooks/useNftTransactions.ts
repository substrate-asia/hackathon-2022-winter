import useSWR from "swr";
import { moralisApiToken } from '../../../config/constant'

const fetcher = (address) => {
    const url = `https://deep-index.moralis.io/api/v2/${address}/nft/transfers?chain=eth&limit=100`
    return fetch(url, {
        headers: { 'x-api-key': moralisApiToken }
    }).then(async (res) => { 
        let data = await res.json()
        if (data.total > 500) {
            let ps = []
            for (let i = 500; i < data.total; i += 500) {
                const urli = `https://deep-index.moralis.io/api/v2/${address}/erc20/transfers?chain=eth&offset=${i}&limit=100`
                ps.push(fetch(urli, { headers: { 'x-api-key': moralisApiToken } }).then(res => res.json()))
            }
            let datas = await Promise.all(ps)
            datas.forEach(d => {
                data.result = [...data.result, ...d.result]
            })
            return new Promise<any>((resolve, reject) => {
                resolve(data)
            })
        } else {
            return new Promise<any>((resolve, reject) => {
                resolve(data)
            })
        }
    })
}

const useNftTransactions = (address?: string, chainId?: string) => {
    const data = useSWR(address ? [address] : null, fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return data
}
export { useNftTransactions }