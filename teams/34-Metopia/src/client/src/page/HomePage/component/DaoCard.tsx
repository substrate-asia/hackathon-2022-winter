import React from 'react'
import { localRouter } from '../../../config/urls'
import { WrappedLazyLoadImage } from '../../../component/image'
import './DaoCard.scss'

const DaoCard = (props) => {
    return <div className='dao-card' key={'dao-card' + props.id}>
        <div className='head' onClick={() => window.location.href = localRouter('dao.prefix') + props.slug} >
            <WrappedLazyLoadImage className="bg avatar" src={props.avatar} alt="" />
            <div className="name">{props.name}</div>
            <img src="https://oss.metopia.xyz/imgs/star.svg" className='favorite-icon' style={{ display: 'none' }} alt=""/>
            {
                props.verified ?
                    <img src="https://oss.metopia.xyz/imgs/verified.svg" className='verified' alt=""/> :
                    null
            }
        </div>
        <div className='text-container'>
            <div className='group' onClick={() => window.location.href = localRouter('dao', { dao: props.slug, subpage: 2 })}>
                <div className='title' >Voters</div>
                <div className='value'>{props.voterCount || 0}</div>
                <div className='active'>{props.admins?.length || 0} admins</div>
            </div>
            <div className='group' onClick={() => window.location.href = localRouter('dao', { dao: props.slug, subpage: 0 })}>
                <div className='title'>Proposals</div>
                <div className='value'>{props.proposalCount || 0}</div>
                <div className='active'>{props.activeProposalCount || 0} active</div>
            </div>
            <div className='group' onClick={() => window.location.href = localRouter('dao', { dao: props.slug, subpage: 1 })}>
                <div className='title'>Raffles</div>
                <div className='value'>{props.raffleCount || 0}</div>
                <div className='active'>{props.activeRaffleCount || 0} active</div>
            </div>
        </div>
    </div>
}
export default DaoCard