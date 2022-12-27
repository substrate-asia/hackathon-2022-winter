
import React, { useMemo, useState } from 'react'
import { BulletList } from 'react-content-loader'
import { HollowButton, MainButton } from '../../component/button'
import { useWallet } from '../../config/redux'
import { localRouter } from '../../config/urls'
import { useDaoListData } from '../../core/governanceApiHooks'
import { compareIgnoringCase } from '../../utils/stringUtils'
import DaoCard from './component/DaoCard'
import SearchInput from './component/SearchInput'
import './index.scss'

const HomePage = () => {
    const { data: daoData } = useDaoListData()
    const [keyword, setKeyword] = useState('')
    const [wallet] = useWallet()

    const account = wallet?.address
    const daoContainer = useMemo(() => {
        if (!daoData) {
            return <BulletList width={'600px'} />
        }
        let daoObjs = daoData.map(s => {
            return Object.assign({}, s, { settings: JSON.parse(s.settings) })
        }).filter(s => {
            if(s.settings?.strategies?.find(str=>{
                if(str.name=='balanceof-sub-nft'){
                    return true
                }
            })){
                return true
            }else{
                return false
            }

        }).filter(c => c.settings.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1).sort((s1, s2) => {
            if (s1.activeProposalCount || 0 > s2.activeProposalCount || 0) {
                return -1
            } else if (s1.activeProposalCount || 0 < s2.activeProposalCount || 0) {
                return 1
            } else if (s1.proposalCount || 0 > s2.proposalCount || 0) {
                return -1
            } else if (s1.proposalCount || 0 < s2.proposalCount || 0) {
                return 1
            } else if (s1.raffleCount || 0 > s2.raffleCount || 0) {
                return -1
            } else if (s1.raffleCount || 0 < s2.raffleCount || 0) {
                return 1
            } else if (s1.id < s2.id) {
                return -1
            } else {
                return 1
            }
        })
        return <div className='dao-card-container'>{
            daoObjs.map(c =>
                <DaoCard key={"dao-card" + c.id} id={c.id} name={c.settings.name} coverUrl={c.settings.banner || c.settings.avatar ||
                    "https://oss.metopia.xyz/imgs/default-bg-light.png"}
                    avatar={c.settings.avatar}
                    slug={c.id}
                    joined={false} memberCount={0}
                    voterCount={c.voterCount}
                    proposalCount={c.proposalCount}
                    raffleCount={c.raffleCount}
                    activeProposalCount={c.activeProposalCount}
                    activeRaffleCount={c.activeRaffleCount}
                    verified={c.verified}
                    admins={c.settings?.admins} />
            )
        }</div>
    }, [daoData, keyword])

    return <div className='home-page'><div className='fifa-head'>
        <div className='banner' onClick={() => window.location.href = "https://metopia.xyz/beta/fifa"}><img src="https://oss.metopia.xyz/imgs/fifa-banner2.png" alt="" /></div>
        <div className='sbt-entrance'>
            <div className='title'>
                Metopia
                Badge
                alpha testing
            </div>
            <HollowButton className="button" onClick={() => {
                window.location.href = localRouter('badge.create')
            }}>Coming soon <img src="https://oss.metopia.xyz/imgs/arrow-left.svg" style={{ transform: 'rotate(180deg) scaleX(1.4)' }} alt="" /></HollowButton>
        </div>
    </div>
        <div className='body'>
            <div className='head'>
                <div className='title'>
                    <div className='text'>Explore Spaces</div>
                </div>
                <SearchInput onChange={setKeyword} />
                <MainButton solid onClick={() => {
                    window.location.href = localRouter('dao.create')
                }}
                    style={process.env.NODE_ENV == 'production' ? { marginLeft: 'auto', borderRadius: '8px', width: '200px',  } :
                        { marginLeft: 'auto', borderRadius: '8px', width: '200px' }}
                >Create my Space</MainButton>
            </div>
            {daoContainer}
        </div>
    </div >
}

export default HomePage
