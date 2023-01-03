
import React, { useEffect, useMemo } from 'react'
import { useWallet } from '../../../../../config/redux'
import { ProposalSettingsForm } from '../../../../../core/dao/type'
import { max } from '../../../../../utils/numberUtils'
import StrategyInput from '../module/StrategyInput'
import './VotingPowerSubpage.scss'

const VotingPowerSubpage = (props: { data: ProposalSettingsForm, setData, page, onSelect }) => {
    const { data, setData, page, onSelect } = props
    const [wallet] = useWallet()
    const [account, defaultChainId] = [wallet, '0xzzzz']

    useEffect(() => {
        if (data.strategies?.length === 0) {
            setData({
                strategies: [newMembership(1)]
            })
        }
    }, [data.strategies, setData])

    const newMembership = id => {
        return {
            id,
            collectionId:''
        }
    }
    return <div className='voting-power-subpage'>
        {/* <div className='guidance'>
            <div className='title'><img src="https://oss.metopia.xyz/imgs/lightbulb.svg" alt="" />In Metopia, you can set your members' rights based on their holdings, off-chain contributions and on-chain achievements. We provide two modes to set the voting powers.</div>
            <ul>
                <li><span className='highlight'>In quick mode</span>, simply input the NFT's contract address, every NFT will therefore have the same voting power.</li>
                <li><span className='highlight'>In advanced mode</span>, you are able to set customized parameters based on a series of metadata collated, this will come in the form of holding periods and NFT attributes.</li>
            </ul>
        </div> */}
        <div className='main-container' style={page === 1 ? null : { display: 'none' }}>
            <div className='card-container'>
                {
                    data.strategies?.map((strategy, i) => {
                        return <StrategyInput key={`StrategyInput-${strategy.id}`}
                            data={strategy}
                            onChange={(params) => {
                                setData({
                                    strategies: data.strategies.map(tmp => {
                                        return tmp.id === strategy.id ?
                                            Object.assign({}, tmp, params) :
                                            tmp
                                    })
                                })
                            }} onDelete={data.strategies.length === 1 ? null : () => {
                                setData({ strategies: data.strategies.filter(tmp => strategy.id !== tmp.id) })
                            }} displayedId={i + 1}
                        />
                    })
                }
            </div>
            <div className='add-more-strategy-button' onClick={() => {
                let maxId = max(data.strategies, "id")
                setData({
                    strategies: [...(data.strategies.map(s => {
                        return Object.assign({}, s)
                    })), newMembership(maxId + 1)]
                })
            }}>
                <span style={{ transform: 'translateY(-1px)', fontSize: '20px' }}>+</span>&nbsp;&nbsp;Add strategy
            </div>
        </div>
    </div>
}

export default VotingPowerSubpage