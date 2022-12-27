
import React, { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { chainMap } from '../../../config/constant'
import { useWallet } from '../../../config/redux'
import { nftDataApi } from '../../../config/urls'
import { DaoSettings } from '../../../core/dao/type'
import { useDaoById, useScoreData } from '../../../core/governanceApiHooks'
import { useRaffleList } from '../../../core/raffleApi'
import { encodeQueryData } from '../../../utils/restUtils'
import { compareIgnoringCase } from '../../../utils/stringUtils'
import ProposalDashboard from './dashboard/ProposalDashboard'
import Head from './head'
import './index.scss'
import ProposalSubpage from './subpage/ProposalSubpage'
import { encodeAddress } from '@polkadot/util-crypto';

const DaoHomePage = (props) => {
    const { slug } = props
    const [searchParams] = useSearchParams();
    const subpage = parseInt(searchParams.get('subpage'))

    const { data: daoData } = useDaoById(slug)
    const daoSettings: DaoSettings = useMemo(() =>
        daoData?.settings ? JSON.parse(daoData.settings) : null
        , [daoData])
    const { data: raffles } = useRaffleList(slug)

    const [wallet] = useWallet()
    const [account, chainId] = [wallet?.address, '0xzzzz']
    const mainAssetNetwork = useMemo(() => {
        if (daoSettings?.strategies?.length) {
            return '0x' + parseInt(daoSettings.strategies[0].network).toString(16)
        }
    }, [daoSettings])

    const { data: myScore } = useScoreData(slug, null, daoSettings?.strategies, account ? [encodeAddress(account, 2)] : null)

    const isAdmin = useMemo(() => {
        return daoSettings?.admins?.find(ad => compareIgnoringCase(ad, account))
    }, [daoSettings, account])

    const isAuthor = useMemo(() => {
        if (!account)
            return false
        if (daoSettings?.members?.find(ad => compareIgnoringCase(ad, account))) {
            return true
        } else if (daoSettings?.filters?.onlyMembers) {
            return false
        }
        if (!daoSettings?.filters?.onlyMembers && daoSettings?.filters?.minScore > 0) {
            if (myScore && (myScore[account] || 0) >= daoSettings.filters.minScore) {
                return true
            } else {
                return false
            }
        }
        return true
    }, [daoSettings, myScore, account])

    const dashboardEle = useMemo(() => {
        return <ProposalDashboard slug={slug}
            isAuthor={isAuthor}
            style={daoSettings?.strategies ? null : { display: 'none' }} />
    }, [slug, daoSettings, isAuthor])

    const subpageEle = useMemo(() => {
        return <ProposalSubpage slug={slug} />
    }, [slug])

    useEffect(() => {
        if (
            (daoSettings?.name && !daoSettings?.strategies && subpage == 2) ||
            (mainAssetNetwork != '0x1' && subpage == 2)
        ) {
            window.location.href = "?subpage=0"
        }
    }, [daoSettings, subpage, mainAssetNetwork])

    return <div className="dao-home-page">
        <Head banner={daoSettings?.banner?.length ? daoSettings.banner : 'https://oss.metopia.xyz/imgs/default-bg-light.png'}
            avatar={daoSettings?.avatar} name={daoSettings?.name}
            editable={daoSettings?.admins?.find(ad => compareIgnoringCase(ad.toLowerCase(), account))} slug={slug}
            about={daoSettings?.about} website={daoSettings?.website} opensea={daoSettings?.opensea}
            discord={daoSettings?.discord} twitter={daoSettings?.twitter} />
        <div className='dao-reward-banner-wrapper'><img src="https://oss.metopia.xyz/imgs/dao-reward-banner5.png" /></div>
        <div className="main-container">
            <div className='content-container' >
                <div className='head'>
                    <div className="submenu">
                        <div className={'item' + (isNaN(subpage) || subpage === 0 ? ' selected' : '')}><a href="?subpage=0">Proposal</a></div>
                    </div>
                </div>

                <div className="dashboard-container" style={daoSettings?.strategies || subpage == 1 ? null : { display: 'none' }}>
                    {dashboardEle}
                </div>
                <div className='content-wrapper'>
                    {subpageEle}
                </div>
            </div>
        </div>
    </div>
}

export default DaoHomePage