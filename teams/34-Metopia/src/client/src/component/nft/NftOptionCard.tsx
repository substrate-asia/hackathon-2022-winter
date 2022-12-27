import React from 'react';
import { OnClickFuncType } from '../../config/type/docTypes';
import { NftImage } from '../image';
import './NftOptionCard.scss';

declare interface ParamType {
    noLazy?: boolean;
    noTick?: boolean;
    src: string;
    selected: boolean;
    size?: number[];
    tokenAddress: string;
    tokenId: number;
    chainId: string;
    onClick: OnClickFuncType;
    afterLoaded?;
}

const NftOptionCard = (props: ParamType) => {
    const { size, afterLoaded, tokenId, chainId, tokenAddress } = props

    return (
        <div className={"nft-option-card" + (props.selected ? ' selected' : '')} onClick={props.onClick} style={size ? {
            minWidth: size[0] + 'px',
            maxWidth: size[1] + 'px',
            width: size[1] + 'px'
        } : {}}>
            <div className="content">
                <NftImage defaultSrc={props.src} chainId={chainId} tokenId={tokenId} contract={tokenAddress}
                    width={size[1]}
                    className="image" afterLoaded={afterLoaded} />
                {props.noTick ? null : <img src="https://oss.metopia.xyz/check_box_off.svg" className="unchecked-icon" alt="" />}
                {props.noTick ? null : <img src="https://oss.metopia.xyz/check_box_on.svg" className="checked-icon" alt="" />}
            </div>
        </div>
    )
}

export default NftOptionCard