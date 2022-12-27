import parse from 'html-react-parser'
import React, { useEffect, useMemo, useState } from 'react'
import { DefaultAvatarWithRoundBackground, WrappedLazyLoadImage } from '../../../../component/image'
import { localRouter, thumbnail } from '../../../../config/urls'
import { toFixedIfNecessary } from '../../../../utils/numberUtils'
import { addrShorten, capitalizeFirstLetter } from '../../../../utils/stringUtils'
import './ProposalCard.scss'
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';

const ProposalCard = (props) => {
    const { account } = props

    const state = useMemo(() => {
        return props.state.toLowerCase()
    }, [props.state, props.quorum, props.choices, props.scores])

    return <div className="proposal-card">
        <div className="head">
            <div className="user-info" onClick={e => window.location.href = `${localRouter('profile')}${props.author}`}>
                {
                    account?.avatar ? <WrappedLazyLoadImage className="avatar" alt="" src={thumbnail(account.avatar, 40, 40)} /> :
                        <DefaultAvatarWithRoundBackground wallet={props.author} className="avatar" />
                }
                <div className="username">{account?.username || props.username || addrShorten(encodeAddress(props.author))}</div>
            </div>
            <div className="state">
                <div className={"left-part " + state}>{capitalizeFirstLetter(state)}</div>
                <div className="right-part">{props.scores_total ? toFixedIfNecessary(props.scores_total, 1) : 0} Power</div>
            </div>
        </div>
        <div className="body">
            <div className="title"><a href={(props.body?.indexOf('{') == 0 ? localRouter('proposal.fifa') : localRouter('proposal.prefix')) + props.id}>{props.title}</a></div>
            <div className="content">{props.body?.indexOf('{') == 0 ? JSON.parse(props.body).subtitle : parse(props.body)}</div>
        </div>
    </div >
}

export default ProposalCard
