import React from 'react';
import Modal from 'react-modal';
import { MainButton } from '../../button';
import './index.scss';
import useAlertModal, {toast} from './useAlertModal'

const defaultAlertModalStyle = {
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
        width: '480px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '16px',
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.6)',
        border: '0',
        backdropFilter: 'blur(12px)'
    }
}

const AlertModal = props => {
    const { isShow, title, body, warning, hide } = useAlertModal()

    return <Modal
        appElement={document.getElementById('root')}
        isOpen={isShow}
        style={Object.assign({}, defaultAlertModalStyle, props.style || {})}>
        <div className={'alert-modal-container' + (warning ? ' warning' : '')}>
            <div className={'title'}>
                {
                    warning ? <img src="https://oss.metopia.xyz/imgs/alert-gray.svg" alt=""  style={{ width: '40px', height: '40px' }} /> :
                        <img src="https://oss.metopia.xyz/imgs/checked.svg" style={{ width: '40px', height: '40px' }} />
                }
                <div className='text'>{title}</div>
            </div>
            <div className='body'>{body}</div>
            <div className='button-container'><MainButton onClick={hide}>Got it</MainButton></div>
        </div>
    </Modal>
}

export default AlertModal
export { useAlertModal , toast};

