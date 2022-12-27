
import parse from 'html-react-parser';
import React, { useEffect, useMemo, useState } from "react";
import { MainButton } from "../../../component/button";
import { StandardAvatar } from '../../../component/image';
import { useWallet } from '../../../config/redux';
import { localRouter } from "../../../config/urls";
import { useAccountData, useActiveList } from "../../../core/accountApiHooks";
import { DaoSettings } from '../../../core/dao/type';
import { useDaoByIds } from '../../../core/governanceApiHooks';
import { usePersonalDiscordData } from "../../../third-party/discord";
import { useTwitterData } from '../../../third-party/twitter';
import { encodeQueryData } from '../../../utils/restUtils';
import { compareIgnoringCase } from "../../../utils/stringUtils";
import ActiveSpaceModal from './component/ActiveSpaceModal';
import './index.scss';
import DonationSubpage from "./subpage/DonationSubpage";
import FungiblesSubpage from './subpage/FungiblesSubpage';
import GovernanceSubpage from './subpage/GovernanceSubpage';
import PoapSubpage from "./subpage/PoapSubpage";

const ProfilePage = (props) => {
    const { slug, subpage, code, oauth_token, oauth_verifier } = props
    const { data: accountData } = useAccountData(slug)
    const [expandIntroduction, setExpandIntroduction] = useState(false)

    const { data: activeList } = useActiveList(slug)
    const { data: activeDaoList } = useDaoByIds(activeList?.list?.map(a => a.daoId))
    const [activeHoldingDetailList, setActiveDaoDetailList] = useState(null)
    const [showActiveSpaceModal, setShowActiveSpaceModal] = useState(false)

    const [wallet, connect] = useWallet()
    const account = wallet?.address

    useEffect(() => {
        if (activeDaoList?.length && slug) {
            let fetchers = []
            activeDaoList.forEach(dao => {
                let settings = JSON.parse(dao.settings) as DaoSettings
            })
            Promise.all(fetchers).then(setActiveDaoDetailList)
        }

    }, [slug, activeList, activeDaoList])

    usePersonalDiscordData(slug, code)
    useTwitterData(slug, oauth_token, oauth_verifier)

    useEffect(() => {
        if (!slug) {
            connect().then(account => {
                if (account?.length) {
                    window.location.href = encodeQueryData(localRouter('profile') + account,
                        { subpage });
                } else {
                    window.location.href = localRouter('home')
                }
            }).catch(e => {
                window.location.href = localRouter('home')
            })
        }
    }, [slug, subpage, connect])

    const { subpageJsx, subpageIndex } = useMemo(() => {
        if (!slug)
            return {}
        let tmpJsx = <GovernanceSubpage slug={slug} />,
            tmpIndex = 5
        if (subpage === -1) {
            tmpJsx = <FungiblesSubpage slug={slug} />
            tmpIndex = -1
        } else if (subpage === 'donations') {
            tmpJsx = <DonationSubpage slug={slug} />
            tmpIndex = 2
        } else if (subpage === 'poap') {
            tmpJsx = <PoapSubpage slug={slug} />
            tmpIndex = 3
        }
        return { subpageJsx: tmpJsx, subpageIndex: tmpIndex }
    }, [slug, subpage])

    let profileIntroduction = window.document.getElementById('profile-introduction')
    let introductionOverflow = profileIntroduction?.scrollHeight > 72

    const containsSocialInfo = (accountData?.twitterUserId && accountData.twitterUserId != '0') || (accountData?.discordId && accountData.discordId != '0')
    return <div className="profile-page">
        <img src="https://oss.metopia.xyz/imgs/default-bg-light.png" alt="" className='bg' />
        <div className="container">
            <div className="basic-profile">
                <div className="container">
                    <div className={'avatar-wrapper' + (compareIgnoringCase(account, slug) ? " editable" : '')} onClick={e => {
                        if (compareIgnoringCase(account, slug))
                            window.location.href = localRouter('profile.edit', { slug })
                    }}>
                        <StandardAvatar user={accountData && accountData.id ? accountData : { owner: slug }} height={96} className={'avatar'} />
                    </div>
                    <div className="basic-profile">
                        <div className="name-wrapper">
                            <div className="name">{accountData?.username || slug}</div>
                        </div>
                        <div className={"button-wrapper" + (compareIgnoringCase(account, slug) ? "" : ' Hidden')}>
                            {
                                <MainButton style={compareIgnoringCase(account, slug) ? null : { display: 'none' }} onClick={e => {
                                    if (compareIgnoringCase(account, slug))
                                        window.location.href = localRouter('profile.edit', { slug })
                                }}>Edit profile</MainButton>
                            }
                        </div>
                    </div>
                    <div className="metopia-info-container">
                        <div className="data-wrapper">
                            <div className='label'>Active in</div>
                            <div className={'value' + (activeHoldingDetailList?.length ? ' selectable' : '')}
                                onClick={e => {
                                    activeHoldingDetailList?.length && setShowActiveSpaceModal(true)
                                }}>
                                {activeList?.total != null ? activeList?.total : '...'}
                                &nbsp;DAOs
                                {activeHoldingDetailList?.length ? <img src="https://oss.metopia.xyz/imgs/chevron.svg" alt="" /> : ''}</div>
                        </div>
                    </div>
                    <div className='social-container' style={containsSocialInfo ? null : { display: 'none' }}>
                        <div className='title'>Social</div>
                        <div className='content'  >
                            {
                                accountData?.twitterUserId && accountData.twitterUserId != '0' ?
                                    <div className='item' title={accountData.twitterScreenName}>
                                        <img src="https://oss.metopia.xyz/imgs/twitter.svg" style={{ width: '16px', marginLeft: '4px', marginRight: '5px' }} alt="" />
                                        <div className='label'>Twitter</div>
                                        <div className='value'>{accountData.twitterScreenName}</div>
                                        <img src="https://oss.metopia.xyz/imgs/share-w.svg" className='link' onClick={e => {
                                            window.open(`https://twitter.com/${accountData.twitterScreenName}`)
                                        }} alt="" />
                                    </div> : null
                            }{
                                accountData?.discordId && accountData.discordId != '0' ?
                                    <div className='item'>
                                        <img src="https://oss.metopia.xyz/imgs/discord.svg" style={{ width: '16px', marginLeft: '4px', marginRight: '5px' }} alt="" />
                                        <div className='label'>Discord</div>
                                        <div className='value'>{accountData.discordName}</div>
                                    </div> : null
                            }
                        </div>
                    </div>
                    <div className='introduction-container'>
                        <div className='title'>About</div>
                        <div className={'content' + (expandIntroduction ? ' expand' : '')} id="profile-introduction">
                            {accountData?.introduction ? parse(accountData.introduction) : 'No introduction about this user'}
                        </div>
                        <div className={'Button' + (introductionOverflow ? ' display' : '') + (expandIntroduction ? ' expand' : '')} onClick={() => {
                            setExpandIntroduction(true)
                        }} >more<img src="https://oss.metopia.xyz/imgs/chevron.svg" alt="" /></div>
                    </div>
                </div>
            </div>
            <div className="body">
                <div className="main-title">
                    <div className="sub-menu-bar">
                        <div className={"sub-menu-item" + (subpageIndex === 5 ? ' selected' : '')}
                            onClick={() => window.location.href = encodeQueryData(localRouter('profile') + slug, { subpage: 'governance' })}>Governance</div>
                    </div>
                </div>
                <div className="content-container">
                    {subpageJsx}
                </div>
            </div>
        </div>

        <ActiveSpaceModal isShow={showActiveSpaceModal} onHide={() => setShowActiveSpaceModal(false)} data={activeHoldingDetailList} />
    </div >
}

export default ProfilePage