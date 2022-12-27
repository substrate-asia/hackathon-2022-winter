import useSWR from "swr";
const uniswap_v3_url = "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-subgraph"

const fetcher = (url, holdings) => {
    
    let symbols = "[", names = "["
    holdings.forEach(h => {
        symbols += '"' + h.symbol + '",'
        names += '"' + h.name + '",'
    });
    symbols = symbols.substring(0, symbols.length - 1) + "]"
    names = names.substring(0, names.length - 1) + "]"
    let queryql = `{tokens(orderBy:volumeUSD orderDirection: desc where:{ symbol_in:${symbols} name_in:${names}}){ id symbol name volumeUSD }}`
    const load = { query: queryql, variables: null }
    return fetch(url, {
        method: 'post',
        body: JSON.stringify(load),
        mode: 'cors'
    }).then((res: Response) => {
        let tmp = res.json()
        // tmp.data.tokens = tmp.date.tokens.filter()
        return tmp
    }).then(d => {
        let arr = d.data.tokens.filter(t => {
            return parseFloat(t.volumeUSD) > 10000
        })
        if (arr.length == 0)
            return null
        let ids = "["
        arr.forEach(h => {
            ids += '"' + h.id + '",'
        });
        ids = ids.substring(0, ids.length - 1) + "]"
        let timestamp = Math.floor(Date.now() / (60 * 60 * 24) / 1000) * 3600 * 24
        let queryql2 = `{tokenDayDatas(where:{ token_in:${ids} date:${timestamp}}){ token{symbol name} priceUSD }}`
        const load2 = { query: queryql2, variables: null }
        return fetch(url, {
            method: 'post',
            body: JSON.stringify(load2),
            mode: 'cors'
        }).then((res2: Response) => {
            let tmp = res2.json()
            return tmp
        })
    })
}

export const usePriceData = (holdings) => {
    const { data, error } = useSWR(
        holdings && holdings.length > 0 ? [uniswap_v3_url, holdings] : null,
        fetcher,
        {
            refreshInterval: 0,
            revalidateOnFocus: false
        })
    return { data, error }
}

