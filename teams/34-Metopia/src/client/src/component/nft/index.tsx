import React, { useEffect, useMemo, useState } from 'react'
import FlexibleOrderedContainer from '../../component/FlexibleOrderedContainer'
import { getNFTReadableSrc, nftEqual } from '../../utils/nftUtils'
import AutoTextOverflowContainer from '../AutoTextOverflowContainer'
import './index.scss'
import NftOptionCard from './NftOptionCard'

const NftCollectionNameButton = (props) => {
    return <div className={'nft-collection-name-button-wrapper' + (props.selected ? " selected" : '')}>
        <div className="nft-collection-name-button" onClick={() => {
            props.onClick && props.onClick(!props.selected)
        }}>{props.children}</div></div>
}

const NftSelectionPane = (props: {
    sortedNfts, onSelect?: (nft, boolean, string) => any, minWidth?, maxWidth?, gap?, noTick?,
    selectedNft?: { token_address, token_id }, afterLoaded?
}) => {
    const { sortedNfts, onSelect, minWidth, maxWidth, gap, noTick, afterLoaded } = props
    const [selectedNft, setSelectedNft] = useState(null)
    const [selectedContracts, setselectedContracts] = useState([])
    const [nftDisplayUrls, setNftDisplayUrls] = useState({})

    useEffect(() => {
        if (sortedNfts?.length && selectedContracts.length === 0) {
            setselectedContracts(['1', sortedNfts[0].tokenAddress])
        }
    }, [sortedNfts, selectedContracts])

    useEffect(() => {
        if (props.selectedNft) {
            setSelectedNft(props.selectedNft)
        }
    }, [props.selectedNft])

    const cards = useMemo(() => {
        let arr = []
        sortedNfts?.forEach(nftGroup => {
            if (!selectedContracts.find(i => i === nftGroup.tokenAddress))
                return null
            return nftGroup.data.forEach((nft, j) => {
                let src = getNFTReadableSrc(nft)
                arr.push(<NftOptionCard
                    chainId={nft.chain_id || nft.chainId}
                    tokenAddress={nft.token_address}
                    tokenId={nft.token_id} selected={nftEqual(selectedNft, nft)}
                    size={minWidth && maxWidth ? [minWidth, maxWidth] : [90, 120]}
                    key={'NftOptionCard-' + (nft.token_id || j) + "-" + nft.token_address}
                    src={src} noTick={noTick}
                    onClick={(e) => {
                        if (nftEqual(selectedNft, nft)) {
                            setSelectedNft(null)
                            onSelect && onSelect(nft, false, null)
                        } else {
                            setSelectedNft(nft)
                            onSelect && onSelect(nft, true, nftDisplayUrls[`${nft.token_address}-${nft.token_id}`])
                        }
                    }} afterLoaded={url => {
                        let tmp = nftDisplayUrls
                        tmp[`${nft.token_address}-${nft.token_id}`] = url
                        setNftDisplayUrls(tmp)
                        afterLoaded && afterLoaded(nft, url)
                    }} />
                )
            })
        })
        return arr
    }, [sortedNfts, onSelect, minWidth, maxWidth, noTick, selectedContracts, selectedNft])

    return <div className="nft-selection-pane">
        <AutoTextOverflowContainer height={32} contentId="profile-nft-collection-name-pane" style={{
            marginBottom: '24px'
        }}>
            <div className='nft-collection-name-button-container'>
                {sortedNfts?.map((nftGroup, i) => {
                    return <NftCollectionNameButton key={'nftGroup--' + i} selected={selectedContracts.find(c => c === nftGroup.tokenAddress)}
                        onClick={() => {
                            let tmp = selectedContracts.map(i => i)
                            if (!tmp.find(c => c === nftGroup.tokenAddress)) {
                                tmp.push(nftGroup.tokenAddress)
                            } else {
                                tmp = tmp.filter(t => t !== nftGroup.tokenAddress)
                            }

                            setselectedContracts(tmp)
                        }}>{nftGroup.name}({nftGroup.data.length})</NftCollectionNameButton>
                })
                }
            </div>
        </AutoTextOverflowContainer>
        <div className="image-container">
            <FlexibleOrderedContainer elementMinWidth={props.minWidth || 90} elementMaxWidth={props.maxWidth || 90}
                gap={props.gap || 10} style={{ marginTop: '10px' }} >
                {cards}
            </FlexibleOrderedContainer>
        </div>
    </div>
}


export { NftSelectionPane, NftOptionCard, NftCollectionNameButton }
