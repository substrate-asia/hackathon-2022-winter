import React, { useMemo, useState } from 'react';
import { BulletList } from 'react-content-loader';
import Modal from 'react-modal';
import { WrappedLazyLoadImage } from '../../../../../component/image';
import { usePoapData } from '../../../../../third-party/rss3';
import { customFormat } from '../../../../../utils/timeUtils';
import ProfileTable from '../../component/ProfileTable';
import './index.scss';

const PoapContentModalStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '1100px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '32px',
        padding: 0,
        overflow: 'hidden'
    }
}

const PoapContentModal = (props) => {
    const { isShow, hide, data } = props
    return <Modal
        size="xl"
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={hide}
        style={Object.assign({}, PoapContentModalStyle, props.style || {})}>
        <div className="poap-content-modal">
            <div className="head">
                <div className="title">POAP</div>
                <img src="https://oss.metopia.xyz/imgs/close.svg" alt="close" onClick={hide} />
            </div>
            <div className='body'>
                <div className='container'>
                    <div className='avatar-wrapper'>
                        <div className="avatar">
                            <WrappedLazyLoadImage src={data?.actions&&data?.actions[0].metadata.image} alt="" />
                        </div>
                    </div>
                </div>
                <div className='container right'>
                    <div className="group">
                        <div className='title'>Title</div>
                        <div>{data?.actions&&data?.actions[0].metadata.title}</div>
                    </div>
                    {/* <div className="group">
                        <div className='title'>Description</div>
                        <div className='description-area'>{data.actions[0].metadata.title}</div>
                    </div> */}
                    <div className="group">
                        <div className='title'>Date</div>
                        <div>{data?.timestamp ? customFormat(new Date(data.timestamp), '#YYYY#-#MM#-#DD#') : ''}</div>
                    </div>
                    {
                        data.event_url ? <div className="group">
                            <div className='title'>Link</div>
                            <a href={data?.actions&&data?.actions[0].metadata.external_link}>{data?.actions&&data?.actions[0].metadata.external_link}</a>
                        </div > : null
                    }
                </div>
            </div>
        </div >
    </Modal >
}

const PoapSubpage = (props) => {
    const { slug } = props
    const { data: poapData } = usePoapData(slug)

    const [selectedPoapData, setSelectedPoapData] = useState({})
    const [showModal, setShowModal] = useState(false)
    const poapTable = useMemo(() => {
        return poapData?.result && <ProfileTable data={poapData.result.map(d => {
            return [d.actions[0].metadata.name,
            customFormat(new Date(d.timestamp), '#YYYY#-#MM#-#DD#')]
        })} heads={['POAP Event', 'Date']} onSelect={(i) => {
            window.open(poapData.result[i].actions[0].metadata.external_link)
            // setSelectedPoapData(poapData.result[i])
            // setShowModal(true)
        }} />
    }, [poapData])

    return poapData ? <div className='poap-subpage' style={{}}>
        {poapData.result?.length > 0 ? poapTable : <div className="no-content-container" style={{ boxShadow: 'unset' }}>You have not collected any POAPs.</div>}
        <PoapContentModal isShow={showModal} hide={() => { setShowModal(false) }} data={selectedPoapData} />
    </div> : <div style={{ boxShadow: 'unset' }} className="no-content-container" >
        <BulletList style={{ height: '200px' }} color="#ffffff" />
    </div>
}

export default PoapSubpage