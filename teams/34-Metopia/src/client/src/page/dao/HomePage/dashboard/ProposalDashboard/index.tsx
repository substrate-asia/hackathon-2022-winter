import React, { useMemo } from 'react'
import { MainButton } from '../../../../../component/button'
import { suitablePeriodUnit, unitTextToNum } from '../../../../../component/form'
import { useAlertModal } from '../../../../../component/modals/AlertModal'
import { localRouter } from '../../../../../config/urls'
import { DaoSettings } from '../../../../../core/dao/type'
import { useDaoById } from '../../../../../core/governanceApiHooks'
import { toFixedIfNecessary } from '../../../../../utils/numberUtils'
import './index.scss'

const ProposalDashBoard = props => {
    const { slug, isAuthor, style } = props
    const { data: daoData } = useDaoById(slug)
    const daoSettings: DaoSettings = useMemo(() =>
        daoData?.settings ? JSON.parse(daoData.settings) : null
        , [daoData])
    const proposalCount = daoData?.proposalCount || 0
    const { display: alert } = useAlertModal()

    return <div className='proposal-dashboard' style={style}>
        <div className='author-pane'>
            <div className='text-wrapper'>
                <div className='title'>Create</div>
                <div className='subtitle'>Create a proposal to empower your community.</div>
            </div>
            <MainButton disabled={!isAuthor} onClick={() => {
                window.location.href = localRouter('proposal.create', { dao: slug })
            }}>Create a proposal</MainButton>
        </div>
        <div className='overview-pane' >
            <img src="https://oss.metopia.xyz/imgs/dao-home-overview-bg.png" alt="" className='bg' />
            <div>
                <div className='title'>Overview</div>
                <div className='stats-wrapper'>
                    <div className="stats">
                        <div className="number">{proposalCount}</div>
                        <div className="text">Proposals</div>
                    </div>
                    <div className="stats">
                        <div className="number">{daoData?.voterCount}</div>
                        <div className="text">Votes</div>
                    </div>
                </div>
            </div>
            <div className='button-wrapper'>
                <div onClick={() => alert('coming soon')} className="Button">
                    <img src="https://oss.metopia.xyz/imgs/stats-p.svg" alt="" />
                    More details
                </div>
            </div>
        </div>
        <div className='rules-pane'>
            <div>
                <div className='title'>
                    <div className='text'>Rules</div>
                    <div className='button' onClick={e => {
                        window.location.href = localRouter('dao.settings.rulesDetails', { dao: slug })
                    }}>Details <img src="https://oss.metopia.xyz/imgs/chevron-p.svg" /></div>
                </div>
                {
                    daoSettings?.filters?.minScore > 0 ?
                        <div className='stats'>
                            <div className="text">Author requirement</div>
                            <div className="number">{daoSettings?.filters?.minScore}</div>
                        </div> : null
                }
                <div className='stats'>
                    <div className="text">Quorum</div>
                    <div className="number">{daoSettings?.voting?.quorum}</div>
                </div>
                <div className='stats'>
                    <div className="text">Review period</div>
                    <div className='duration-wrapper'>
                        <div className="number">{
                            daoSettings?.voting?.delay ?
                                toFixedIfNecessary(daoSettings?.voting?.delay / unitTextToNum(suitablePeriodUnit(daoSettings?.voting?.delay)), 2) :
                                'Flexible'
                        }</div>
                        {
                            daoSettings?.voting?.delay ?
                                <div className="text">{suitablePeriodUnit(daoSettings?.voting?.delay)}</div> : null
                        }
                    </div>
                </div>
                <div className='stats'>
                    <div className="text">Voting period</div>
                    <div className='duration-wrapper'>
                        <div className="number">{
                            daoSettings?.voting?.period ?
                                toFixedIfNecessary(daoSettings?.voting?.period / unitTextToNum(suitablePeriodUnit(daoSettings?.voting?.period)), 2) :
                                'Flexible'
                        }</div>
                        {
                            daoSettings?.voting?.period ?
                                <div className="text">{suitablePeriodUnit(daoSettings?.voting?.period)}</div> : null
                        }
                    </div>
                </div>
            </div>
        </div></div >
}

export default ProposalDashBoard