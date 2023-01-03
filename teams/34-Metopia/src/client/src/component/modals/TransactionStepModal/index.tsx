import React from 'react';
import Modal from 'react-modal';
import './index.scss';

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
        width: '600px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '16px',
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#25283Bdd',
        border: '0',
        backdropFilter: 'blur(12px)'
    }
}

export type TransactonStep = {
    title: string,
    body: any,
}

export const TransactionStepModal = (props: {
    title,
    introduction,
    steps: TransactonStep[],
    onHide,
    show,
    stepIndex: number
}) => {
    const { title, introduction, steps, onHide, show, stepIndex } = props
    return <Modal
        appElement={document.getElementById('root')}
        onRequestClose={() => {
            onHide()
        }}
        isOpen={show}
        style={defaultProfileCompleteModalStyle}>
        <div className='transaction-step-modal-container'>
            <div className='head'>
                <div className='text'>{title}</div>
                <img src="https://oss.metopia.xyz/imgs/close.svg" className='Button' alt="X" onClick={onHide} />
            </div>
            <div className='body'>
                <div className='introduction'>{introduction}</div>
                {
                    steps.map((step, i) => {
                        return <div className={'step' + (stepIndex > i ? ' done' : '') + (stepIndex < i ? ' undone' : '')} key={`step-${i}`}>
                            <div className='title'>
                                {
                                    stepIndex > i ? <img src="https://oss.metopia.xyz/imgs/green-tick.svg" /> :
                                        <img src="https://oss.metopia.xyz/imgs/green-dot.svg" />
                                }
                                <div className='text'>{step.title}</div>
                            </div>
                            <div className='body'>
                                {step.body}
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    </Modal>
}
