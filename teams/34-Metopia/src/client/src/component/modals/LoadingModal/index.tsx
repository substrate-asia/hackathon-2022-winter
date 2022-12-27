import React from 'react';
import Modal from 'react-modal';
import CircleLoader from "react-spinners/CircleLoader";
import './index.scss';
import useLoadingModal from './useLoadingModal';

const defaultLoadingModalStyle = {
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
        width: '280px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '16px',
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.6)',
        border: '0',
        backdropFilter: 'blur(12px)'
    }
}

const LoadingModal = props => {
    const { isShow, tip } = useLoadingModal()

    return <Modal
        appElement={document.getElementById('root')}
        isOpen={isShow}
        style={Object.assign({}, defaultLoadingModalStyle, props.style || {})}>
        <div className='loading-modal-container'>
            <CircleLoader size="70px" color={'#ffffff'} />
            <div className='tip'>{tip?.length ? tip : 'System is processing'}</div>
        </div>
    </Modal>
}

export default LoadingModal
export { useLoadingModal };

