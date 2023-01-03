import React, { useMemo, useState } from 'react'
import { BulletList } from 'react-content-loader'
import Modal from 'react-modal'
import { WrappedLazyLoadImage } from '../../../../../component/image'
import { useGitcoinData } from '../../../../../third-party/rss3'
import { calcDecimal } from '../../../../../utils/numberUtils'
import { customFormat } from '../../../../../utils/timeUtils'
import ProfileTable from '../../component/ProfileTable'
import Reference from '../../component/Reference'
import './index.scss'


const DonationContentModalStyle = {
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

const DonationContentModal = (props) => {
    const { isShow, hide, data } = props
    return <Modal
        size="xl"
        appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={hide}
        style={Object.assign({}, DonationContentModalStyle, props.style || {})}>
        <div className="donation-content-modal">
            <div className="head">
                <div className="title">Donation</div>
                <img src="https://oss.metopia.xyz/imgs/close.svg" alt="close" onClick={hide} />
            </div>
            <div className='body'>
                <div className='container'>
                    <div className='avatar-wrapper'>
                        <div className="avatar">
                            <WrappedLazyLoadImage src={data?.logo} alt="" />
                        </div>
                    </div>
                </div>
                <div className='container right'>
                    <div className="group">
                        <div className='title'>Title</div>
                        <div>{data?.title}</div>
                    </div>
                    <div className="group">
                        <div className='title'>Description</div>
                        <div className='description-area'>{data?.description}</div>
                    </div>
                    <div className="group">
                        <div className='title'>Date</div>
                        <div>{data?.date ? customFormat(data.date, '#YYYY#-#MM#-#DD#') : ''}</div>
                    </div>
                    {
                        data?.link ? <div className="group">
                            <div className='title'>Link</div>
                            <a href={data.link}>{data.link}</a>
                        </div > : null
                    }
                </div>
            </div>
        </div >
    </Modal >
}

const summarizeGitcoinData = (data) => {
    let buff = {}
    data?.result.forEach(d => {
        d.actions.forEach(act => {

            if (!buff[act.metadata.token.symbol]) {
                buff[act.metadata.token.symbol] = 0
            }

            buff[act.metadata.token.symbol] +=
                calcDecimal(parseFloat(act.metadata.token.value), act.metadata.token.decimals)
        })

    })
    return Object.keys(buff).map(symbol => { return { symbol: symbol, amount: buff[symbol] } })
}
const DonationSubpage = (props) => {
    const { slug } = props
    const { data: gitcoinData } = useGitcoinData(slug)
    const [showModal, setShowModal] = useState(false)
    const [selectedDonation, setSelectedDonationData] = useState()

    const [gitcoinTableData, gitcoinDisplayData] = useMemo(() => {
        let result = [], gitcoinDisplayData = []
        if (gitcoinData?.result?.length) {
            result = []
        }
        gitcoinData?.result?.forEach(res => {
            res.actions.forEach(act => {
                result.push([
                    <div className="gitcoin-table-title-wrapper">
                        <img src={act.metadata.logo} className="gitcoin-table-logo" alt="" />
                        {act.metadata.title}
                    </div>, act.metadata.token.symbol, calcDecimal(act.metadata.token.value, act.metadata.token.decimals),
                    customFormat(new Date(res.timestamp), '#YYYY#-#MM#-#DD#')
                ])
                gitcoinDisplayData.push({
                    title: act.metadata.title,
                    logo: act.metadata.logo,
                    description: act.metadata.description,
                    date: new Date(res.timestamp),
                    link: act.related_urls?.length ? act.related_urls[0] : null
                })
            })
        })
        return [result, gitcoinDisplayData]
    }, [gitcoinData])

    return <div className="donation-subpage">
        <div className="gitcoin-container">
            <div className="head" style={{ display: 'none' }}>
                <div className="gitcoin-summary-container">
                    <div className="title">Overall Gitcoin donations</div>
                    <div className="data-wrapper">
                        {gitcoinData?.result?.length ? summarizeGitcoinData(gitcoinData).map(s => {
                            return <div className="data" key={"GitcoinSummaryData" + s}>{s.symbol} <span className='number'>{s.amount.toFixed(1)}</span></div>
                        }) : <div className='data'>None</div>}
                    </div>
                </div>
                <div className='gitcoin-reference-container'>
                    <Reference sources={[{ link: "https://rss3.io/", imgUrl: "https://oss.metopia.xyz/imgs/rss3logo.svg" }]} />
                </div>
            </div>
            {!gitcoinData?.result ?
                <div style={{ marginTop: '20px' }} className="no-content-container" >
                    <BulletList style={{ height: '200px' }} color="#ffffff" />
                    {/* <ReactLoading height={21} width={40} color='#333' /> */}
                </div> : (gitcoinData?.result?.length ?
                    <div className='gitcoin-detail-container'>
                        <ProfileTable heads={['Title', 'Token/Coin', 'Amount', 'Date']}
                            data={gitcoinTableData} onSelect={(i) => {
                                window.open(gitcoinDisplayData[i].link)
                                // setSelectedDonationData(gitcoinDisplayData[i])
                                // setShowModal(true)
                            }} />

                    </div> :
                    <div className="no-content-container" style={{ marginTop: '20px' }}>You have not donated to any projects.</div>)
            }
            <DonationContentModal isShow={showModal} hide={() => { setShowModal(false) }} data={selectedDonation} />

        </div>
    </div>
}

export default DonationSubpage
