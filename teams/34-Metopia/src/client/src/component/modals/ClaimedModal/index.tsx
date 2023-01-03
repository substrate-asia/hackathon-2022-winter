import React from 'react'
import useClaimedModal from './useClaimedModal'
import Modal from 'react-modal';
import { MainButton } from '../../button';

const defaultClaimedCardModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '100vw',
        height: '100vh',
        transform: 'translate(-50%, -50%)',
        borderRadius: '16px',
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.6)',
        border: '0',
        backdropFilter: 'blur(12px)'
    }
}

const ClaimedModal = () => {
    const isShow = true // useClaimedModal()
    
    return (<Modal
        appElement={document.getElementById('root')}
        isOpen={isShow}
        style={Object.assign({}, defaultClaimedCardModalStyle, {})}>
            <div className="fire-animation-one"></div>
            <div className="fire-animation-two"></div>
            <div className='claimed-container'>
                <div className='light-container'></div>
                <img src="/imgs/claim-card.png" alt="nft information, world cup words and a hero image with football" />
                <div className='claimed-message-container'>
                    <h1>Claimed successful</h1>
                    Congratulations! You've successfully claimed the free activity SBT. Enjoy the World Cup! <br />
                    You can share with friends to get initial points.
                </div>
                <div className='button-container'>
                    <MainButton className='button-twitter' children='Share to twitter'/> 
                    <MainButton className='button-activity' children='Enter activity'/>
                </div>
            </div>

        </Modal>
    )
}

export default ClaimedModal
export { useClaimedModal }