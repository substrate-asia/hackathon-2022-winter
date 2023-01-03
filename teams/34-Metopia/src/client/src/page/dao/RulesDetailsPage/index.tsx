
import React, { useEffect, useMemo, useState } from 'react'
import { suitablePeriodUnit, unitTextToNum } from '../../../component/form'
import { NftImage, StandardAvatar } from '../../../component/image'
import { chainMap } from '../../../config/constant'
import { useWallet } from '../../../config/redux'
import { localRouter } from '../../../config/urls'
import { useAccountListData } from '../../../core/accountApiHooks'
import { DaoSettings } from '../../../core/dao/type'
import { useDaoById } from '../../../core/governanceApiHooks'
import { useGuildsData, useRolesData } from '../../../third-party/discord'
import { getRandomNft } from '../../../third-party/moralis'
import { toFixedIfNecessary } from '../../../utils/numberUtils'
import { compareIgnoringCase } from '../../../utils/stringUtils'
import './index.scss'

const StrategyCard = props => {
    const { strategy, index } = props
    const [sampleNft, setSampleNft] = useState(null)

    let holdingBonusList = strategy.params.bonusList?.filter(b => {
        return b.type == 'holding'
    })

    let traitBonusList = strategy.params.bonusList?.filter(b => {
        return b.type == 'traits'
    })

    useEffect(() => {
        let addr = strategy.params.address
        getRandomNft(strategy?.network, addr, data => {
            setSampleNft(data?.result[0])
        })
    }, [strategy])

    let sampleNftMetadata = sampleNft?.metadata && sampleNft?.metadata != 'null' ? JSON.parse(sampleNft.metadata) : null

    return <div className='strategy-card'>
        <div className='title'>{`Strategy ${index + 1}`} - {chainMap['0x' + parseInt(strategy.network).toString(16)]}</div>
        <div className='basic-info'>
            <div className='text-wrapper'>
                <div className='attr-group'>
                    <div className='label'>Chain</div>
                    <div className='value'>{chainMap['0x' + parseInt(strategy.network).toString(16)]}  </div>
                </div><div className='attr-group'>
                    <div className='label'>Address</div>
                    <div className='value'>{strategy.params.address}</div>
                </div>
                <div className='attr-group'>
                    <div className='label'>Voting power</div>
                    <div className='value'>{strategy.params.defaultWeight} per token</div>
                </div>
            </div>
            <div className='nft-wrapper'>
                {
                    sampleNft ? <NftImage className="nft-image" width={94} chainId={strategy?.network} tokenId={sampleNft.token_id}
                        contract={sampleNft.token_address} defaultSrc={sampleNftMetadata?.image || sampleNftMetadata?.image_url || ''} /> :
                        <div className='nft-image'></div>
                }
                <div className='text'>
                    <div className='title'>Token brief</div>
                    <div className='name' title={sampleNft?.name}>{sampleNft?.name}</div>
                </div>
            </div>
        </div>
        {
            holdingBonusList?.length ? <div className='body'>
                <div className='attr-group'>
                    <div className='label'>Extra VP</div>
                    <div className='value'>{strategy.params.bonusList?.length ?
                        <div className='bonus-group'>
                            <div className='title'>
                                <div>Holding period</div>
                                <div>Bonus rate</div>
                            </div>
                            {
                                holdingBonusList.map(b => {
                                    return <div className='bonus'>
                                        <div>≥ {b.value} {b.unit}s</div>
                                        <div>{toFixedIfNecessary((b.weight - 1) * 100, 0)}%</div>
                                    </div>
                                })
                            }
                        </div> : null
                    }
                    </div>
                </div>
            </div> : null
        }

    </div>
}

const UserCard = props => {
    const { user } = props

    return <div className='user-card'>
        <StandardAvatar user={user} height={48} className={'avatar'} />
        {/* {
            user?.avatar ? <div className='avatar-wrapper'>
                <div className='inner-avatar-wrapper'>
                    <WrappedLazyLoadImage className="avatar" alt="" src={thumbnail(user.avatar, 46, 46)} />
                </div>
            </div> :
                <DefaultAvatarWithRoundBackground wallet={user.owner} className="avatar" height={48} />
        } */}

        <div className='name'>{user.username || user.owner}</div>
    </div>
}

const RulesDetailsPage = props => {
    const { slug } = props

    const { data: daoData } = useDaoById(slug)
    const settings: DaoSettings = useMemo(() =>
        daoData?.settings ? JSON.parse(daoData.settings) : null
        , [daoData])
    // const [settings, setSettings] = useState(null)
    const { data: accountData } = useAccountListData(settings?.members)
    const { data: guildsData } = useGuildsData()
    const { data: rolesData } = useRolesData(settings?.validation?.params?.guildId)
    
    const [wallet] = useWallet()
    const account = wallet?.address
    
    const editable = useMemo(() => {
        return settings?.admins?.find(ad => compareIgnoringCase(ad, account))
    }, [settings, account])

    let placeholders = []
    if (settings?.members?.length) {
        for (let i = 0; i < (4 - settings.members.length % 4); i++) {
            placeholders.push(<div style={{ width: '260px', height: '1px' }} key={`placeholder-${i}`}></div>)
        }
    }

    let delayUnit = suitablePeriodUnit(settings?.voting?.delay)
    let delay = settings?.voting?.delay ?
        toFixedIfNecessary(settings?.voting?.delay / unitTextToNum(delayUnit), 2) : 0
    let periodUnit = suitablePeriodUnit(settings?.voting?.period)
    let period = settings?.voting?.period ?
        toFixedIfNecessary(settings?.voting?.period / unitTextToNum(periodUnit), 2) : 0

    const selectedDiscord = guildsData?.find(g => g.guildId == settings?.validation?.params?.guildId)
    return <div className='rules-details-page'>
        <div className="title"><img src="https://oss.metopia.xyz/imgs/arrow-left.svg" className="backarrow" alt="back"
            onClick={() => {
                window.location.href = localRouter("dao.prefix") + (slug)
            }} />Rules details
            {
                editable ? <div onClick={() => {
                    window.location.href = localRouter('dao.settings.proposal', { dao: slug })
                }} className="edit-button"  >
                    <img src="https://oss.metopia.xyz/imgs/write-gray.svg" alt="" />
                </div> : null
            }
        </div>
        <div className='info-group'>
            <div className='head'>
                <img src="https://oss.metopia.xyz/imgs/triangle.svg" style={{ transform: 'rotate(90px)' }} />
                <div className='text'>Voting power</div>
            </div>
            <div className='strategy-container'>
                {
                    settings?.strategies.map((str, i) => {
                        return <StrategyCard strategy={str} key={`strategy-card-${i}`} index={i} />
                    })
                }
            </div>
        </div>
        <div className='info-group'>
            <div className='head'>
                <img src="https://oss.metopia.xyz/imgs/triangle.svg" style={{ transform: 'rotate(90px)' }} />
                <div className='text'>Proposal validation</div>
            </div>
            {
                settings?.filters?.minScore > 0 ?
                    <div className='rules-container'>
                        <div className='title'>Loyal Members</div>
                        <div className='attr-group'>
                            <div className='label'>Requirement</div>
                            <div className='value'>≥ &nbsp; {settings?.filters?.minScore || 0}&nbsp; VP</div>
                        </div>
                    </div> : null
            }
            {
                settings?.members?.length ?
                    <div className='rules-container'>
                        <div className='title'>Assigned</div>
                        <div className='author-container'>
                            {
                                settings?.members.map((user, i) => {
                                    return <UserCard user={accountData?.list?.find(acc => compareIgnoringCase(acc.owner, user)) || { owner: user }}
                                        key={`user-card-${i}`} />
                                })
                            }
                            {placeholders}
                        </div>
                    </div> : null
            }{
                settings?.validation?.params?.guildId ?
                    <div className='rules-container'>
                        <div className='title'>Discord roles</div>
                        <div className='discord-container'>
                            <img className="avatar" src={`https://cdn.discordapp.com/icons/${selectedDiscord?.guildId}/${selectedDiscord?.icon}`} />
                            <div className='text-wrapper'>
                                <div className='name'>{selectedDiscord?.name}</div>
                                <div className='role-wrapper'>
                                    {
                                        rolesData?.filter(r1 => {
                                            return settings.validation.params.roles?.find(r2 => {
                                                return compareIgnoringCase(r1.roleId, r2)
                                            })
                                        }).map(r => {
                                            return <div className='role'>{r.name}</div>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div> : null
            }
        </div>
        <div className='info-group'>
            <div className='head'>
                <img src="https://oss.metopia.xyz/imgs/triangle.svg" style={{ transform: 'rotate(90px)' }} alt=""/>
                <div className='text'>Duration &amp; quorum</div>
            </div>
            <div className='rules-container'>
                <div className='title'>Preview period</div>
                <div className='attr-group'>
                    <div className='label'>{settings?.voting?.delay ? 'Standard' : 'Flexible'}</div>
                    <div className='value'>{settings?.voting?.delay ?
                        delay + " " + delayUnit : ''}</div>
                </div>
            </div>
            <div className='rules-container'>
                <div className='title'>Voting period</div>
                <div className='attr-group'>
                    <div className='label'>{settings?.voting?.period ? 'Standard' : 'Flexible'}</div>
                    <div className='value'>{settings?.voting?.delay ?
                        period + " " + periodUnit : ''}</div>
                </div>
            </div>
            <div className='rules-container'>
                <div className='title'>Quorum</div>
                <div className='attr-group'>
                    <div className='label'>{settings?.voting.quorum ? 'Standard' : 'Flexible'}</div>
                    <div className='value'>{settings?.voting.quorum ? settings?.voting.quorum + " VP" : ''} </div>
                </div>
            </div>
        </div>
    </div>

}

export default RulesDetailsPage