import useSize from '@react-hook/size';
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import ReactLoading from 'react-loading';
import useSWR from "swr";
import { nftDataApi, thumbnail } from '../../config/urls';
import { encodeQueryData } from '../../utils/restUtils';
import './index.scss';

interface LazyLoadImageParam {
    src: string;
    alt?: string;
    className?: string;
    defaultSrc?: string
    onError?;
    style?: CSSProperties;
}

interface NftImageParam {
    defaultSrc: string;
    chainId: string;
    contract: string;
    tokenId: number;
    width: number;
    className?: string;
    afterLoaded?;
}

const WrappedLazyLoadImage = (image: LazyLoadImageParam) => {
    const [loading, setLoading] = useState(true)
    const containerRef = useRef(null)
    const [width, height] = useSize(containerRef)
    const [redirectedSrc, setRedirectedSrc] = useState(null)

    const src = useMemo(() => {
        let result = null
        if (image?.src?.indexOf("ipfs://") === 0)
            result = "https://metopia.mypinata.cloud/ipfs/" + image.src.substring(7, image.src.length)
        else if (image?.src?.indexOf("https://ai.metopia.xyz/data-center/nfts/image") === 0) {
            if (!redirectedSrc) {
                setRedirectedSrc('')
                fetch(image?.src).then(res => res.json()).then(res => {
                    setRedirectedSrc(res?.data?.image)
                })
            }
            result = null
        } else {
            result = image?.src
        }
        return result || redirectedSrc
    }, [image, redirectedSrc])
    return (
        <div className={'wrapped-lazy-load-image ' + (image.className ? image.className : '')} ref={containerRef} style={image?.style}>
            {
                <div className='wrapper'>

                    <img alt={image.alt || ''} onLoad={() => setLoading(false)}
                        src={src?.length ? src : (image.defaultSrc || 'https://oss.metopia.xyz/imgs/no-image-available.png')}
                        onError={e => {
                            image.onError && image.onError(src?.length ? src : (image.defaultSrc || 'https://oss.metopia.xyz/imgs/no-image-available.png'))
                        }} />
                </div>
            }
            {
                loading ? <ReactLoading type={'spin'} color={'#ddd'} height={Math.min(Math.min(width, height) / 2, 160)} width={Math.min(Math.min(width, height) / 2, 160)} className="loading" /> : null
            }
        </div>
    )
}

const fetcher = (chainId, contract, tokenId, width) => {
    return fetch(nftDataApi.nft_image + '?chain_id=0x' + parseInt(chainId).toString(16) + '&address=' + contract + "&token_id=" + tokenId + (width ? "&width=" + width : "")).then((res) => res.json())
}

const NftImage = (props: NftImageParam) => {
    const { defaultSrc, chainId, contract, tokenId, width, className, afterLoaded } = props
    const [url, setUrl] = useState(defaultSrc)
    const [refreshFlag, setRefreshFlag] = useState(false)
    const { data: cachedUrlData } = useSWR(contract && tokenId ? [chainId, contract, tokenId, width, refreshFlag] : null, fetcher)
    const [srcError, setSrcError] = useState(null)
    
    useEffect(() => {
        if (url)
            afterLoaded && afterLoaded(url)
    }, [url])

    useEffect(() => {
        if (cachedUrlData) {
            if (cachedUrlData.code === 90 && cachedUrlData.msg === "NFT not found") {
                fetch(encodeQueryData(nftDataApi.nft_cache,
                    { address: contract, token_id: tokenId, chain_id: '0x' + parseInt(props.chainId || '1').toString(16) })
                ).then((res) => res.json()).then(res => {
                    setRefreshFlag(true)
                })
            }
            else {
                let src = cachedUrlData.data.image

                if (src) {
                    src = src.replace("http://47.57.243.177:16001", "https://ai.metopia.xyz/testimage")
                    if (src.indexOf("aliyun:") === 0) {
                        src = src.replace("aliyun:", '')
                        if (src.indexOf('mp4') == -1 && src.indexOf('svg') == -1 && srcError?.indexOf('metopia') == -1) {
                            src = thumbnail(src, width, width)
                        }
                    }

                    src = src.replace('http://metopia.oss-accelerate.aliyuncs.com', 'https://oss.metopia.xyz').
                        replace('http://metopia.oss-cn-hongkong.aliyuncs.com', 'https://oss.metopia.xyz')
                    setUrl(src)
                }
            }
        }
    }, [cachedUrlData, contract, tokenId, srcError])
    return <WrappedLazyLoadImage alt={""} src={url}
        className={className} defaultSrc={defaultSrc} onError={setSrcError} style={width?{width:width+'px'}:null}/>
}

export * from './DefaultAvatar';
export { WrappedLazyLoadImage, NftImage };

