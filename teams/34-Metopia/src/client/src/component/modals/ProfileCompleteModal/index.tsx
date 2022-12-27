
import React, { useMemo } from 'react';
import Modal from 'react-modal';
import { useWallet } from '../../../config/redux';
import { localRouter } from '../../../config/urls';
import { toFixedIfNecessary } from '../../../utils/numberUtils';
import { MainButton } from '../../button';
import './index.scss';
import useProfileCompleteModal from './useProfileCompleteModal';

const defaultProfileCompleteModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(6px)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '444px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '16px',
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#25283Bdd',
        border: '0',
        backdropFilter: 'blur(12px)'
    }
}

const ProfileCompleteModal = props => {
    const { hide, isShow, state } = useProfileCompleteModal()
    const [wallet] = useWallet()
    const account = wallet?.address

    return <Modal
        onRequestClose={hide}
        appElement={document.getElementById('root')}
        isOpen={isShow}
        style={Object.assign({}, defaultProfileCompleteModalStyle, props.style || {})}>
        <div className='profile-complete-modal-container'>
            <div className='head'>
                <div className='text'>Complete your profile</div>
                <img src="https://oss.metopia.xyz/imgs/close.svg" className='Button' alt="X" onClick={hide} />
            </div>
            <div className='body'>
                <div className='progress-bar'>
                    <div className='solid-bar' style={{ width: state * 100 + "%" }}></div>
                </div>
                <div className='text'>Your profile is <span className='number'>{toFixedIfNecessary(state * 100, 2) + "%"}</span> completed.&nbsp;
                    Please provide <span className='number'>{100 + "%"}</span> information and proceed the procedure.</div>
                <div className='button-container'>
                    <MainButton onClick={() => {
                        window.location.href = localRouter("profile.edit", { slug: account })
                    }}>Go to profile</MainButton>
                </div>
            </div>

        </div>
    </Modal>
}

export default ProfileCompleteModal
export { useProfileCompleteModal };
