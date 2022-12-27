import { moralisApiToken } from '../../config/constant'
const resyncToken = (chainId, contract, tokenId, setLoading?: { (boolean): void }, callback?) => {
    if (!chainId || !contract || !tokenId)
        return false
    setLoading && setLoading(true)
    fetch("https://deep-index.moralis.io/api/v2/nft/" + contract + '/' + tokenId + "/metadata/resync?mode=sync&flag=uri&chain=" + chainId, {
        mode: 'cors', headers: {
            'x-api-key': moralisApiToken
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Something went wrong');
    }).then(() => {
        setLoading && setLoading(false)
        callback && callback()

    }).catch(e => {
        console.error(e)
        setLoading && setLoading(false)
    })
}


const getErc20Asset = (chainId, contract, tokenId, setLoading: { (boolean): void }, callback?) => {
    setLoading(true)
    fetch("https://deep-index.moralis.io/api/v2/nft/" + contract + '/' + tokenId + "/metadata/resync?mode=sync&flag=uri&chain=" + chainId, {
        mode: 'cors', headers: {
            'x-api-key': moralisApiToken
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Something went wrong');
    }).then(() => {
        setLoading(false)
        callback && callback()

    }).catch(e => {
        console.error(e)
        setLoading(false)
    })
}

const getRandomNft = async (chainId, contract, callback?, setLoading?: { (boolean): void }) => {
    if (!chainId || !contract)
        return false
    setLoading && setLoading(true)
    // https://deep-index.moralis.io/api/v2/nft/0x23581767a106ae21c074b2276D25e5C3e136a68b?chain=eth&format=decimal&limit=1
    let result = await fetch("https://deep-index.moralis.io/api/v2/nft/" + contract + "?format=decimal&limit=1&chain=" + ('0x' + parseInt(chainId).toString(16)), {
        mode: 'cors', headers: {
            'x-api-key': moralisApiToken
        }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Something went wrong');
    }).then((res) => {
        setLoading && setLoading(false)
        callback && callback(res)
    }).catch(e => {
        console.error(e)
        setLoading && setLoading(false)
    })
    return result
}
export { resyncToken, getRandomNft };

