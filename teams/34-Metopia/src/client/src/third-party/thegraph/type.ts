
export declare type SwapData = {
    amountUSD: string,
    timestamp: string,
    amount0,
    amount1,
    token0: {
        symbol: string
    },
    token1: {
        symbol: string
    }
}
export declare type WrappedSwapData={
    data:{
        swaps:SwapData[]
    }
}