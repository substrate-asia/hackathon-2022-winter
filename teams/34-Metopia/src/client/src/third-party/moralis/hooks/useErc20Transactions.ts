import useSWR from "swr";
import { moralisApiToken } from '../../../config/constant';
import { useWallet } from "../../../config/redux";

const cluster = (raw, address) => {
    let addr = address.toLowerCase()
    let res = {}
    if (raw && raw.result) {
        raw.result.forEach(r => {
            if (!res[r.address]) {
                res[r.address] = []
            }
            let tx = { timestamp: new Date(r.block_timestamp).getTime(), value: r.from_address == addr ? -parseFloat(r.value) : parseFloat(r.value) }
            res[r.address].push(tx)
        })
    }
    Object.keys(res).forEach(key => {
        let tmp = res[key].sort((r1, r2) => {
            if (r1.timestamp < r2.timestamp)
                return -1
            else if (r1.timestamp > r2.timestamp)
                return 1
            else return 0
        })
        let currentHolding = 0, maxHolding = 0, maxHoldingTmp = 0
        let firstBuyingTimestamp = 0
        tmp.forEach((t, i) => {
            currentHolding += t.value
            /**
             * Buying
             */
            if (currentHolding > maxHoldingTmp) {
                maxHoldingTmp = currentHolding
                maxHolding = currentHolding
                if (firstBuyingTimestamp === 0) {
                    firstBuyingTimestamp = t.timestamp
                }
                t.buying = true
            }
            t.current = currentHolding
            t.maxHolding = maxHolding

            /**
             * Clearance
             */
            if (maxHolding > 0 && currentHolding < maxHolding / 10) {
                t.clear = true
                maxHolding = 0
                maxHoldingTmp = currentHolding
                t.duration = t.timestamp - firstBuyingTimestamp
                firstBuyingTimestamp = 0
            } else {
                t.clear = false
                if (i === tmp.length - 1 && firstBuyingTimestamp !== 0) {
                    t.duration = Date.now() - firstBuyingTimestamp
                }
            }

        })
        res[key] = tmp
    })
    return res
}

const analysis = (cluster) => {
    let res = {}
    Object.keys(cluster).forEach(key => {
        let totalDuration = 0, clearanceCount = 0, maxDuration = 0, minDuration = Number.MAX_VALUE
        cluster[key].forEach((tx, i) => {
            if (tx.duration) {
                totalDuration += tx.duration
                if (i !== cluster[key].length)
                    clearanceCount += 1
                if (tx.duration > maxDuration)
                    maxDuration = tx.duration
                if (tx.duration < minDuration)
                    minDuration = tx.duration
            }
        })

        res[key] = {
            txs: cluster[key], totalDuration, clearanceCount, maxDuration, minDuration, avgDuration: totalDuration / (clearanceCount || 1)
        }
    })
    return res
}

const fetcher = (address) => {
    const url = `https://deep-index.moralis.io/api/v2/${address}/erc20/transfers?chain=eth&offset=0&limit=100`
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
            return new Promise((resolve, reject) => {
                resolve(analysis(cluster(data, address)))
            })
        } else {
            return new Promise((resolve, reject) => {
                resolve(analysis(cluster(data, address)))
            })
        }
    })
}

const useErc20Transactions = (address?) => {

    const [wallet] = useWallet()
    const account = wallet?.address

    const data = useSWR((account || address) ? [address] : null, fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return data
}
export { useErc20Transactions };
