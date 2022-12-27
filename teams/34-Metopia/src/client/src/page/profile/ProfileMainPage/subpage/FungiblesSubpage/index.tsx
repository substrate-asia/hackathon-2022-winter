import React, { useMemo } from 'react'
import { useErc20Transactions, useFungibles } from '../../../../../third-party/moralis'
import { usePriceData, useUniswapV3Data } from '../../../../../third-party/thegraph'
import UniswapDataTable from '../../component/UniswapDataTable'
import './index.css'
// Float error?
const handleUniswapV3Data = (data) => {
    let result = []
    let groupedData = {}
    for (let swap of data.data.swaps) {
        if (!groupedData[swap.timestamp]) {
            groupedData[swap.timestamp] = [swap]
        } else {
            groupedData[swap.timestamp] = [...groupedData[swap.timestamp], swap]
        }
    }
    for (let timestamp of Object.keys(groupedData)) {
        let arr = groupedData[timestamp]
        let assetSum = {}
        let fromAsset, toAsset, totalVol = 0
        for (let single of arr) {
            assetSum[single.token0.symbol] = (assetSum[single.token0.symbol] || 0) + (parseFloat(single.amount0))
            assetSum[single.token1.symbol] = (assetSum[single.token1.symbol] || 0) + (parseFloat(single.amount1))
            totalVol += parseFloat(single.amountUSD)
        }
        for (let symbol of Object.keys(assetSum)) {
            if (assetSum[symbol] < 0) {
                fromAsset = symbol
            }
            else if (assetSum[symbol] > 0) {
                toAsset = symbol
            }
        }
        result.push({ timestamp: parseInt(timestamp), from: fromAsset, to: toAsset, volume: totalVol / arr.length })
    }
    return result
}

const handlePriceData = (data) => {
    if (!data || !data.data || !data.data.tokenDayDatas)
        return {}
    let dataObj = {}
    data.data.tokenDayDatas.forEach(d => {
        dataObj[d.token.symbol] = parseFloat(d.priceUSD)
    });
    return dataObj
}

const decimaled2 = (x, n) => {
    for (let i = 0; i < n; i++) {
        x = x / 10
    }
    return x
}


const analysePriceData = (holdings, priceObj) => {
    let res = { totalValue: 0, price: [], tokenMap: {} }
    if (holdings) {
        let priceData = []
        holdings.forEach(h => {
            let balance = decimaled2(parseFloat(h.balance), parseInt(h.decimals))
            let price = priceObj[h.symbol]
            if (price && h.symbol != 'DAI' && !h.symbol.startsWith('USD')) {
                priceData.push({
                    symbol: h.symbol,
                    decimals: parseInt(h.decimals),
                    name: h.name,
                    balance: balance,
                    value: balance * price,
                    address: h.token_address
                })
                res.tokenMap[h.token_address] = {
                    symbol: h.symbol,
                    name: h.name,
                    decimals: parseInt(h.decimals),
                    balance: balance,
                    value: balance * price,
                    address: h.token_address
                }
                res.totalValue += balance * price
            }
        })
        priceData = priceData.sort((r1, r2) => {
            if (r1.value < r2.value)
                return 1
            else if (r1.value > r2.value)
                return -1
            else return 0
        }).filter(r => {
            return r.value > 100
        })
        res.price = priceData
    }
    return res
}

const duration2string = (duration) => {
    return Math.ceil(duration / 1000 / 24 / 3600) + ' days'
}
const FungiblesSubpage = (props) => {
    const { slug } = props
    const { data: uniswapV3RawData, } = useUniswapV3Data(slug)
    const { data: holdings } = useFungibles(slug)
    const { data: prices } = usePriceData(holdings)
    const { data: transactions, error: transactionsError } = useErc20Transactions(slug)

    const analysedPriceData = useMemo(() => {
        return analysePriceData(holdings, handlePriceData(prices))
    }, [holdings, prices])

    const favouritTokens = useMemo(() => {
        if (holdings && analysedPriceData.price.length > 0) {
            let tmp = []
            Object.keys(transactions).forEach(address => {
                const { clearanceCount, avgDuration } = transactions[address]
                tmp.push({ clearanceCount, avgDuration, address })
            });
            tmp = tmp.filter(t => {
                if (t.clearanceCount == 0 && analysedPriceData[t.address] && analysedPriceData[t.address].value < 100) {
                    return false
                } else return true
            }).sort((t1, t2) => {
                // TODO avgDuration
                if (t1.avgDuration > t2.avgDuration) {
                    return -1
                } else if (t1.avgDuration < t2.avgDuration) {
                    return 1
                } else return 0
            })
            let res = []
            tmp.forEach(t => {
                if (res.length >= 3)
                    return
                let target = analysedPriceData[t.address]
                if (target) {
                    res.push({ symbol: target.symbol, name: target.name, clearanceCount: t.clearanceCount, avgDuration: t.avgDuration })
                }
            })
            return res
        }
        return []
    }, [transactions, analysedPriceData, holdings])

    if (uniswapV3RawData) {
        let data = handleUniswapV3Data(uniswapV3RawData)

        return <div className="FungiblesSubpage">
            <div className="UniswapV3Summary FungiblesGroup">
                <div className="UniswapV3SummaryTitle">Statistics:</div>
                <div className="FungiblesStatsGroup">
                    <div>Total Value</div>
                    <div>{analysedPriceData.totalValue.toFixed(2)} USD</div>
                </div>
                {/* <div className="FungiblesStatsGroup">
                    <div>Favourit Tokens</div>
                    <div>{favouritTokens.map(t => {
                        return <div className="FavTokenStats" key={'favtoken' + t.symbol}>
                            <div>{t.symbol}</div>
                            <div>Frequency{t.clearanceCount}</div>
                            <div>Avg Holding Period: {duration2string(t.avgDuration)}</div>
                        </div>
                    })}</div>
                </div> */}
            </div>
            <div className="Portfolio FungiblesGroup">
                <div className="UniswapV3SummaryTitle">Portfolio:</div>
                <table>
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Current Position</th>
                            <th>Value (USD)</th>
                            <th>Avg Holding Period</th>
                            {/* <th>Longest Holding Period</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            analysedPriceData.price.map(d => {
                                return <tr className='ProfileHoldingsWrapper' key={d.symbol + d.name} >
                                    <td>{d.symbol} ({d.name})</td>
                                    <td>{d.balance}</td>
                                    <td>{d.value.toFixed(2)}</td>
                                    <td>{transactions && transactions[d.address] && duration2string(transactions[d.address].avgDuration)}</td>
                                    {/* <td>{transactions&&transactions[d.address].max}</td> */}
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </div>
            <div className="FungiblesGroup">
                <div className="UniswapV3SummaryTitle">Trading Logs:</div>
                <UniswapDataTable data={data} />
            </div>
            <div className="FungiblesSubpageFooter">
                <div className="FungiblesSubpageFooterTitle">Data source:</div>
                <div className="FungiblesSubpageFooterImgWrapper">
                    <a href="https://uniswap.org/"><img src="https://oss.metopia.xyz/imgs/uniswaplogo.svg" alt="" /></a>
                    <a href="https://thegraph.com/hosted-service/"><img src="https://oss.metopia.xyz/imgs/thegraphlogo.svg" alt="" /></a>
                    <a href="https://moralis.io/"><img src="https://oss.metopia.xyz/imgs/moralislogo.svg" alt="" /></a>
                </div>
            </div></div>
    }
    else return null
}

export default FungiblesSubpage