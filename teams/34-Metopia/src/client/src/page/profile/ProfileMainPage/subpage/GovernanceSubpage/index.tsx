import React, { useEffect, useMemo, useState } from 'react'
import { BulletList } from 'react-content-loader'
import useSWR from 'swr'
import { localRouter, nftDataApi } from '../../../../../config/urls'
import { useUserGovernenceData } from '../../../../../core/accountApiHooks'
import './index.scss'
import { encodeAddress } from '@polkadot/util-crypto';

const nftServiceFetcher = (owner) => fetch(nftDataApi.goverance_selectByOwner + "?owner=" + owner).then((res) => res.json())

const useGovernanceData = (address) => {
    const { data, error } = useSWR([address], nftServiceFetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false
    })
    return { data, error }
}

// const snapshotFetcher = (address) => {
//     return fetch("https://hub.snapshot.org/graphql?", {
//         body: JSON.stringify(loadSnapshotHistory(address)),
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         }
//     }).then((res) => res.json())
// }

// const useSnapshotData = (address, flag) => {
//     const { data, error } = useSWR([address, flag], snapshotFetcher, {
//         refreshInterval: 0,
//         revalidateOnFocus: false
//     })
//     return { data, error }
// }
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (date: Date) => {
    return date.getDate() + " " + months[date.getMonth()] + ", " + date.getFullYear()
}

const HistoryCard = (props: { space, title, timestamp, spaceSettings, choices, choice, type, proposalId }) => {
    const { space, title, timestamp, spaceSettings, choices, choice, type, proposalId } = props
    const time = new Date(parseInt(timestamp) * 1000)
    const avatar = spaceSettings.avatar
    const name = spaceSettings.name

    return <div className="history-card" >
        <img src={avatar} className='space-avatar' onClick={e => window.location.href = localRouter('dao', { dao: space })} />
        <div className='body'>
            <div className='head'>
                <img src={type === 'proposal' ? 'https://oss.metopia.xyz/imgs/proposal-icon.svg' : 'https://oss.metopia.xyz/imgs/vote-icon.svg'} alt='' />
                <div>{type === 'proposal' ? 'Proposed' : 'Voted'} on {formatDate(time)}{type === 'vote' ? <>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;Voted on "{choices[parseInt(choice) - 1]}"</> : ''}</div>
            </div>
            <div className='content'><a href={localRouter('proposal.prefix') + proposalId}>{title}</a></div>
        </div>
    </div >
}

const GovernancePager = (props) => {
    const { slug, limit, offset, setTotal } = props
    const { data: governanceData } = useUserGovernenceData(slug, limit, offset)
    useEffect(() => {
        if (governanceData?.total != null) {
            setTotal(governanceData.total)
        }
    }, [governanceData])
    return governanceData?.result ? <>{governanceData.result.map(d => {
        if (typeof (d.spaceSettings) == 'string')
            d.spaceSettings = JSON.parse(d.spaceSettings)
        if (typeof (d.proposalChoice) == 'string')
            d.proposalChoice = JSON.parse(d.proposalChoice)
        return <HistoryCard key={`historycard${d.id}`} space={d.space} title={d.proposalTitle} timestamp={d.timestamp} spaceSettings={d.spaceSettings}
            choices={d.proposalChoice} choice={d.choice} type={d.type} proposalId={d.proposalId} />
    })}</> : <BulletList width={400} />
}
const pageLimit = 20
const GovernanceSubpage = (props) => {
    const { slug } = props
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(null)

    const governancePages = useMemo(() => {
        let tmp = []
        for (let i = 0; i < page; i++) {
            let ksmWallet = encodeAddress(slug, 2)
            tmp.push(<GovernancePager key={`pager${i}`} slug={ksmWallet} limit={pageLimit} offset={i * pageLimit}
                setTotal={val => {
                    if (val !== total) {
                        setTotal(val)
                    }
                }} />)
        }
        return tmp
    }, [slug, page, total])

    return <div className="governance-subpage">
        {
            governancePages
        }
        {
            total != null && total === 0 ?
                <div className="no-content-container" style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
                    <img src="https://oss.metopia.xyz/imgs/exclamation.svg"
                        style={{ height: '24px', marginRight: '16px', transform: "translateY(-1px)" }} />There is no governance data.</div> : null
        }
    </div>

}

export default GovernanceSubpage