import React from 'react'
import { HollowButton, MainButton } from '../../../../../component/button'
import { useLoadingModal } from '../../../../../component/modals/LoadingModal'
import './CreationSubpage.scss'

const CreationSubpage = props => {
    const { onSelect } = props

    return (
        <div className='creation-subpage subpage'>
            <div className='option-container'>
                <div className='option'>
                    <div className='bg-wrapper'>
                        <img className='bg' src="https://oss.metopia.xyz/imgs/create1.png" alt="" />
                    </div>
                    <div className='head'>
                        <div className='title'>Start from scratch</div>
                        <div className='subtitle'>Create a brand new space &amp; start the journey</div>
                    </div>
                    <MainButton style={{ marginTop: 'auto' }} onClick={() => onSelect(0)}>Create <img src="https://oss.metopia.xyz/imgs/arrow-left.svg"
                        style={{ transform: 'rotate(180deg) scaleX(160%)', height: '16px', marginLeft: '10px' }} /></MainButton>
                </div>
                <div className='option'>
                    <div className='bg-wrapper'>
                        <img className='bg' src="https://oss.metopia.xyz/imgs/create2.png" alt="" />
                    </div>
                    <div className='head'>
                        <div className='title'>Import from Snapshot</div>
                        <div className='subtitle'>Import DAO settings from snapshot.org</div>
                    </div>
                    <MainButton style={{ marginTop: 'auto' }} onClick={() => onSelect(1)} >Import <img src="https://oss.metopia.xyz/imgs/arrow-left.svg"
                        style={{ transform: 'rotate(180deg) scaleX(160%)', height: '16px', marginLeft: '10px' }} /></MainButton>
                </div>
            </div>
        </div>
    )
}
export default CreationSubpage