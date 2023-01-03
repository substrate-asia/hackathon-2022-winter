import React from 'react';
import Modal from 'react-modal';
import FlexibleOrderedContainer from '../../../../../component/FlexibleOrderedContainer';
import { NftImage, WrappedLazyLoadImage } from '../../../../../component/image';
import './index.scss';

const tmpstyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '640px',
        height: '80vh',
        transform: 'translate(-50%, -50%)',
        borderRadius: '8px',
        padding: 0,
        overflow: 'hidden',
        position: 'absolute',
        backgroundColor: '#15182B',
        border: 0,
        outline: 0
    }
}

const ActiveSpaceModal = (props: { isShow, onHide, data }) => {
    const { isShow, onHide, data } = props
    return <Modal
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={onHide}
        style={tmpstyle} className="active-space-modal">
        <div className="container">
            <div className="head">
                <div className='title'>Active in {data?.length} spaces</div>
                <img src="https://oss.metopia.xyz/imgs/close.svg" alt="X" onClick={onHide} />
            </div>
            <div className='body'>
                {
                    data?.map((d, i) => {
                        return <div className='active-dao-card' key={`active-dao-card-${i}`}>
                            <div className='head'>
                                <div className='dao-info'>
                                    <WrappedLazyLoadImage src={d.daoAvatar} className='avatar' />
                                    <div className='name'>{d.daoName}</div>
                                </div>
                                <div className='vp-wrapper'>
                                    <img src={'https://oss.metopia.xyz/imgs/vp-p.svg'} alt="" />VP: {d.vp}
                                </div>
                            </div>
                            <div className='image-container'>
                                <FlexibleOrderedContainer elementMinWidth={68} elementMaxWidth={68} gap={24}>
                                    {
                                        d.tokens.map((t, j) => {
                                            return <NftImage key={`NftImage-${j}`}
                                                width={68} defaultSrc={null}
                                                chainId={d.chainId}
                                                contract={d.contract} tokenId={t.token_id} />
                                        })
                                    }
                                </FlexibleOrderedContainer>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    </Modal>

}

export default ActiveSpaceModal