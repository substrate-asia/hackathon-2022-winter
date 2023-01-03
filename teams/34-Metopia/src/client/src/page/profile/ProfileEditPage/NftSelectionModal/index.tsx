import React, { useState } from 'react';
import { BulletList } from 'react-content-loader';
import Modal from 'react-modal';
import CircleLoader from "react-spinners/CircleLoader";
import { HollowButton, MainButton } from '../../../../component/button';
import { NftSelectionPane } from '../../../../component/nft';
import { resyncToken } from '../../../../third-party/moralis';
import './index.scss';

const defaultModalStyle = {
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
        width: '642px',
        maxHeight: '554px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '16px',
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#15182B',
        border: '0',
        backdropFilter: 'blur(12px)'
    }
}

const NftSelectionModal = props => {
    const { isShow, sortedNfts, onHide, onChange } = props
    const [selectedNft, setSelectedNft] = useState(null)
    // let selectedNft = null
    // if (accountData?.avatar) {
    //     let param = decodeQueryData(accountData?.avatar)
    //     selectedNft = {
    //         token_address: param.address, token_id: param.token_id
    //     }
    //     if (accountData.avatar.indexOf('https://oss.metopia.xyz/avatar/') === 0) {
    //         let tmp = accountData.avatar.substring(31)
    //         selectedNft = {
    //             token_address: tmp.split('-')[0], token_id: tmp.split('-')[1].split('.')[0]
    //         }
    //     }
    // }

    // const nftContent = useMemo(() => {
    //     if (!nfts) {
    //         return <div style={{ marginTop: '20px' }}>
    //             <BulletList style={{ height: '200px' }} />
    //         </div>
    //     }
    //     if (sortedNfts) {
    //         if (sortedNfts.length) {

    //             return <div>
    //                 <NftSelectionPane noTick sortedNfts={sortedNfts} maxWidth={120} minWidth={120} gap={12} selectedNft={selectedNft}
    //                     onSelect={(nft, flag, cachedUrl) => {
    //                         if (flag) {
    //                             setSelectedNftData(Object.assign({}, nft, { cachedUrl }))
    //                             if (new Date(nft.last_metadata_sync) < new Date('2022-09-28'))
    //                                 resyncToken(nft.chainId, nft.token_address, nft.token_id)
    //                         } else {
    //                             setSelectedNftData(null)
    //                         }
    //                     }}
    //                 />
    //             </div>
    //         }
    //         else {
    //             return <div className="no-content-container" style={{ marginTop: '20px', color: 'white' }}>You have not collected any NFTs</div>
    //         }
    //     } else return <div style={{ marginTop: '20px' }}>
    //         <BulletList style={{ height: '200px' }} />
    //     </div>
    // }, [sortedNfts, accountData?.avatar])
    return <Modal
        appElement={document.getElementById('root')}
        onRequestClose={onHide}
        isOpen={isShow}
        style={defaultModalStyle}>
        <div className='nft-selection-modal-container'>
            <div className='head'>
                <div className='text'>Avatar</div>
                <img src="https://oss.metopia.xyz/imgs/close.svg" className='Button' alt="X" onClick={onHide} />
            </div>
            <div className='body'>
                <div className='container'>
                {
                    sortedNfts ? (sortedNfts.length ? <NftSelectionPane noTick sortedNfts={sortedNfts} maxWidth={110} minWidth={110} gap={10}
                        selectedNft={selectedNft}
                        onSelect={(nft, flag, cachedUrl) => {
                            if (flag) {
                                setSelectedNft(Object.assign({}, nft, { cachedUrl }))
                                if (new Date(nft.last_metadata_sync) < new Date('2022-09-28'))
                                    resyncToken(nft.chainId, nft.token_address, nft.token_id)
                            } else {
                                setSelectedNft(null)
                            }
                        }}
                    /> : <div className="no-content-container" >
                        <div><img src="https://oss.metopia.xyz/imgs/exclamation.svg" alt="" /></div>
                        <div className='text'>You have not collected any NFTs</div>
                    </div>) : <BulletList style={{ height: '200px' }} />
                }
                </div>
            </div>
            {
                sortedNfts?.length ?
                    <div className='footer'>
                        <HollowButton onClick={onHide}>Cancel</HollowButton>
                        <MainButton onClick={() => {
                            onChange(selectedNft)
                            onHide()
                        }}>Confirm</MainButton>
                    </div> : null
            }
        </div>
    </Modal>
}

export default NftSelectionModal