import React, { useEffect, useMemo, useState } from "react";
import { BulletList } from "react-content-loader";
import { MainButton } from "../../../../../component/button";
import { useWallet } from "../../../../../config/redux";
import { localRouter } from "../../../../../config/urls";
import { useAccountListData } from "../../../../../core/accountApiHooks";
import { useDaoById, useProposalDataBySpace } from "../../../../../core/governanceApiHooks";
import { compareIgnoringCase, unique } from "../../../../../utils/stringUtils";
import { useScrollTop } from "../../../../../utils/useScollTop";
import ProposalCard from "../../component/ProposalCard";
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from "@polkadot/util";

const ProposalCardsPage = (props) => {
    const { slug, leadingChoice, first, skip, daoSettings, accounts, onChange } = props
    const { data: proposals } = useProposalDataBySpace(slug, first, skip)

    useEffect(() => {
        if (proposals?.length) {
            onChange && onChange(proposals)
        }
    }, [proposals])

    return proposals ? <>{proposals.map(p => <ProposalCard quorum={daoSettings?.voting?.quorum}{...p} key={'ProposalCard' + p.id}
        account={accounts?.list?.find(acc => compareIgnoringCase(encodeAddress(acc.owner), encodeAddress(p.author)))} />)}</> : <BulletList width={600} />
}

const ProposalSubpage = (props: { slug }) => {
    const { slug } = props
    const [, atBottom] = useScrollTop()

    const { data: daoData } = useDaoById(slug)
    const daoSettings = daoData?.settings ? JSON.parse(daoData.settings) : {}
    const total = daoData?.proposalCount

    const [authors, setAuthors] = useState([])
    const { data: accounts } = useAccountListData(authors)
    const [wallet] = useWallet()
    const account = wallet?.address

    const proposalsPerPage = 10
    const [page, setPage] = useState(1)
    const [selectedLeadingChoice, setSelectedLeadingChoice] = useState('All')

    const editable = useMemo(() => {
        const settings = daoData?.settings ? JSON.parse(daoData.settings) : {}
        return settings?.admins?.find(ad => compareIgnoringCase(ad, account))
    }, [daoData, account])
    const [pageLoaded, setPageLoaded] = useState(false)

    useEffect(() => {
        if (atBottom && page * proposalsPerPage < total && pageLoaded) {
            setPageLoaded(false)
            setPage(page + 1)
        }
    }, [atBottom, page, total, pageLoaded])

    const pages = useMemo(() => {
        let tmp = []
        for (let i = 0; i < page; i++) {
            tmp.push(<ProposalCardsPage key={`page${i}`} leadingChoice={selectedLeadingChoice} slug={slug} first={proposalsPerPage} skip={proposalsPerPage * i}
                accounts={accounts} daoSettings={daoSettings} onChange={ps => {
                    setAuthors(unique([...authors, ...ps.map(p => {
                        let generic = encodeAddress(p.author)
                        return generic
                        // return p.author
                    })]))
                    setTimeout(() => {
                        setPageLoaded(true)
                    }, 1000);
                }} />)
        }
        return tmp
    }, [slug, page, daoSettings, accounts, authors, selectedLeadingChoice])

    return <div className="proposal-subpage">
        {
            !daoSettings?.name ? <BulletList width={600} /> : (
                !daoSettings.strategies ? (
                    editable ? <div className="no-strategies-container">
                        <div><img src="https://oss.metopia.xyz/imgs/exclamation.svg" alt="" /></div>
                        <div className='text'>Before creating the first proposal,<br /> Please set the rules for the space</div>
                        <MainButton onClick={() => { window.location.href = localRouter('dao.settings.proposal', { dao: slug }) }} solid>Set rules</MainButton>
                    </div> : <div className="no-strategies-container">
                        <div><img src="https://oss.metopia.xyz/imgs/exclamation.svg" alt="" /></div>
                        <div className='text'>Please contact the admins to initialize the proposal rules</div>
                    </div>
                ) :
                    (total === 0 ? <div className="no-strategies-container">
                        <div><img src="https://oss.metopia.xyz/imgs/exclamation.svg" alt="" /></div>
                        <div className='text'>There are no proposals</div>
                    </div> : pages)
            )
        }
    </div>
}

export default ProposalSubpage