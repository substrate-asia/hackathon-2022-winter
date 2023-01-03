const getNFTReadableSrc = (nft) => {
    if (!nft.metadata) {
        return null
    }
    let metadata = nft.metadata
    if (typeof metadata == 'string') {
        try {
            metadata = JSON.parse(nft.metadata)

        } catch (e) {
            console.error(e)
            metadata = {}
        }
    }
    if (!metadata)
        return null
    let src = metadata.image || metadata.image_url
    if (!src)
        return null
    if (src.indexOf('ipfs') === 0) {
        let hash = src.substring(7, src.length)
        if (hash.indexOf('ipfs') === 0) {
            hash = hash.substring(5, hash.length)
        }
        return "https://metopia.mypinata.cloud/ipfs/" + hash
    } else {
        return src
    }
}
const nftEqual = (n1, n2) => {
    return n1?.token_address && n2?.token_address && n1.token_address.toLowerCase() === n2.token_address.toLowerCase() && n1.token_id.toLowerCase() === n2.token_id.toLowerCase()
}

const nftFind = (arr, n2) => {
    return arr && n2 && arr.find(n1 => {
        return n1.token_address.toLowerCase() === n2.token_address.toLowerCase() && n1.token_id.toLowerCase() === n2.token_id.toLowerCase()
    })
}

const getSortedNfts = (list) => {
    let sortedNftList = []
    list.forEach(nft => {
        if (nft.contract_type === 'ERC721') {
            let array = sortedNftList.find(ns => ns.tokenAddress === nft.token_address)
            if (!array) {
                sortedNftList.push({ name: nft.name, tokenAddress: nft.token_address, data: [nft] })
            } else {
                array.data.push(nft)
            }
        }
    })
    return sortedNftList
}
export { getNFTReadableSrc, nftEqual, nftFind, getSortedNfts } 