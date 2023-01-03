
import React, { useEffect, useMemo, useState } from 'react'
import { MainButton } from '../../../../component/button'
import { useAlertModal } from '../../../../component/modals/AlertModal'
import { useLoadingModal } from '../../../../component/modals/LoadingModal'
import FixedablePageHead from '../../../../component/modules/FixedablePageHead'
import { useWallet } from '../../../../config/redux'
import { localRouter, nftDataApi } from '../../../../config/urls'
import { doUpdateDao } from '../../../../core/dao/daoSetters'
import { persistentToProposalForm, proposalFormToPersistent } from '../../../../core/dao/settingsFormatParser'
import { DaoSettings, ProposalSettingsForm } from '../../../../core/dao/type'
import { useDaoById } from '../../../../core/governanceApiHooks'
import { encodeQueryData } from '../../../../utils/restUtils'
import { capitalizeFirstLetter } from '../../../../utils/stringUtils'
import './index.scss'
import LifeCycleSubpage from './subpage/LifeCycleSubpage'
import ProposalAuthenticationSubpage from './subpage/ProposalAuthenticationSubpage'
import VotingPowerSubpage from './subpage/VotingPowerSubpage'

const DaoProposalSettingsPage = props => {
    const { slug } = props
    const [wallet, connect] = useWallet()
    const [page, setPage] = useState(1)
    const [data, setData] = useState<ProposalSettingsForm>(null)
    const { display: displayLoadingModal, hide: hideLoadingModal } = useLoadingModal()
    const { display: alert } = useAlertModal()
    const { data: daoData } = useDaoById(slug)

    const defaultSettings: DaoSettings = useMemo(() =>
        daoData?.settings ? JSON.parse(daoData.settings) : null
        , [daoData])

    useEffect(() => {
        if (defaultSettings) {
            setData(persistentToProposalForm(defaultSettings))
        } else {
            //TEST
            setData(persistentToProposalForm({} as any))
        }
    }, [defaultSettings])


    const submit = () => {
        if (!wallet?.address) {
            connect()
            return
        }
        let settings = Object.assign(defaultSettings, proposalFormToPersistent(data))
        displayLoadingModal('Please sign for the information and update the rules')
        if (settings.validation?.name == 'discord') {
            if (!settings.validation.params?.roles?.length) {
                settings.validation = {
                    name: "basic", params: {}
                }
            }
        }

        if (settings.validation?.name != 'discord' && settings.members?.length > 0 && settings.filters.minScore <= 0) {
            settings.filters.onlyMembers = true
        }

        return doUpdateDao(slug, settings, wallet).then((res) => {
            window.location.href = localRouter('dao.prefix') + slug
        }).catch(() => {
            hideLoadingModal()
            alert("Update failed")
        })
    }

    const smartSetData = (params: Object) => {
        setData(Object.assign({}, data, params))
    }

    const height = useMemo(() => {
        return page === 3 ?
            'fit-content' : (page === 2 ? 'auto' : 'auto')
    }, [page])

    const strategyFilled = data?.strategies.filter(s => {
        return s.collectionId?.length
    }).length

    useEffect(() => {
        if (page > 1) {
            setTimeout(() => {
                if (document.getElementById("RuleSettingsBodyContainer"))
                    document.getElementById("RuleSettingsBodyContainer").style.transition = '0ms'
            }, 300);
        }
        return () => {
            if (document.getElementById("RuleSettingsBodyContainer"))
                document.getElementById("RuleSettingsBodyContainer").style.transition = '300ms'
        }
    }, [page])

    return <div className='dao-proposal-settings-page'>
        <FixedablePageHead backLink={localRouter('dao', { dao: slug })} setPage={setPage} page={page}
            title={<>Set rules{defaultSettings?.name ? <> for <span className='name'>{capitalizeFirstLetter(defaultSettings.name)}</span></> : null}</>}
            steps={[
                { text: 'Voting Power', state: strategyFilled ? page : (page === 1 ? 1 : -1) },
                { text: 'Proposal validation', state: page - 1 },
                { text: 'Duration & Quorum', state: page - 2 }
            ]} />
        <div className={`body page${page}`}>
            {
                data ? <div className='container' style={{ height: height }} id="RuleSettingsBodyContainer">
                    <div className='subpage-wrapper'>
                        <VotingPowerSubpage onSelect={() => { setPage(2) }} data={data} setData={smartSetData} page={page} />
                    </div>
                    <div className='subpage-wrapper'>
                        <ProposalAuthenticationSubpage data={data} setData={smartSetData} page={page} />
                    </div>
                    <div className='subpage-wrapper'>
                        <LifeCycleSubpage data={data} setData={smartSetData} page={page} />
                    </div>
                </div> : null
            }
        </div>
        <div className='footer'>
            <MainButton onClick={() => {
                document.getElementById("RuleSettingsBodyContainer").style.transition = '300ms'
                setPage(page - 1)
            }} style={page === 1 ? { display: 'none' } : null}> <img src="https://oss.metopia.xyz/imgs/arrow-left.svg" style={{ height: '20px' }} alt="" />&nbsp;Previous</MainButton>
            <MainButton onClick={() => {
                document.getElementById("RuleSettingsBodyContainer").style.transition = '300ms'
                setPage(page + 1)
            }} style={page === 3 ? { display: 'none' } : null}>Next &nbsp;<img src="https://oss.metopia.xyz/imgs/arrow-left.svg" style={{ transform: 'rotate(180deg)', height: '20px' }} alt="" /></MainButton>
            <MainButton onClick={submit} style={page !== 3 ? { display: 'none' } : null} disabled={!strategyFilled}
            >Confirm</MainButton>
        </div>
    </div >
}

export default DaoProposalSettingsPage