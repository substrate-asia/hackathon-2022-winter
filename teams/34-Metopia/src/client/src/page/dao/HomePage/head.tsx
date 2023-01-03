import copy from 'copy-to-clipboard'
import parse from 'html-react-parser'
import Dropdown from 'rc-dropdown'
import React, { useState } from 'react'
import { useAlertModal } from '../../../component/modals/AlertModal'
import { GhostButtonGroup } from '../../../component/button'
import { WrappedLazyLoadImage } from '../../../component/image'
import { localRouter } from '../../../config/urls'
import './head.scss'

const Head = (props: { name, banner, avatar, about, slug, editable, website, opensea, discord, twitter, className?, width?: number, preview?: boolean }) => {
    const { name, banner, avatar, about, slug, editable, preview, width } = props
    const [showShareDropdown, setShowShareDropdown] = useState(false)

    const { display: alert } = useAlertModal()

    const getShareTwitterText = () => {
        return 'Hey frens, check out Metopia and their Spaces. ' +
            "I'm exploring their testnet and there are loads of #SoulBound rewards! Come and experience it for yourself!\n"
    }

    return <div className={'dao-home-head ' + (props.className ? props.className : '')} >
        <div className="banner-container" style={props.width ? { height: props.width / 6 + 'px' } : null}>
            {
                banner?.length ? <img src={banner} className="banner-image" /> : null
            }
        </div>
        <div className="profile-container" style={width ? { paddingLeft: width / 10 + 'px' } : null}>
            <div className='avatar-wrapper' style={props.width ? {
                width: props.width / 12 + 'px',
                height: props.width / 12 + 'px',
                paddingBottom: props.width / 12 + 'px',
                marginTop: '-' + props.width / 24 + 'px',
            } : null}>
                {
                    avatar ?
                        <WrappedLazyLoadImage src={avatar} className="avatar" /> :
                        <div className="avatar" />
                }
            </div>
            <div className='text-wrapper'>
                <div className='left'>
                    <div className={"name" + (editable ? ' editable' : '')}>
                        {name}
                    </div>
                    <div className="introduction">{parse(about || '')}</div>
                </div>
                <div className='right'>
                    <div className="link-container">
                        <GhostButtonGroup items={
                            ['website', 'opensea', 'discord', 'twitter'].filter(key => props[key]?.length).map(key => {
                                return {
                                    content: <img src={`https://oss.metopia.xyz/imgs/${key}_purple.svg`} alt="Proposal" />,
                                    onClick: () => window.location.href = props[key].indexOf('http') == 0 ? props[key] : 'https://' + props[key]
                                }
                            })} />
                        {
                            editable ? <img src="https://oss.metopia.xyz/imgs/edit-dao-profile.svg" alt="Edit" title="Edit settings" className='Button' onClick={() => {
                                window.location.href = localRouter('dao.settings.basic', { dao: slug })
                            }} /> : null
                        }
                        <div className='share-button-wrapper' style={preview ? { display: 'none' } : {}} >
                            <Dropdown
                                trigger={['click']}
                                overlay={<></>}
                                animation="slide-up"
                                onVisibleChange={e => {
                                    setTimeout(() => {
                                        setShowShareDropdown(e)
                                    }, 100);
                                }}
                            >
                                <img src="https://oss.metopia.xyz/imgs/dao-home-share.svg" alt=""
                                    className='Button' />
                            </Dropdown>

                            <div className='dropdown'
                                style={showShareDropdown ? { display: 'block' } : { display: 'none' }}>
                                <div className='option' onClick={e => {
                                    copy(window.location.href)
                                    alert('You have copied the link', null, false)
                                }}>Copy link</div>
                                <div className='option' onClick={() => {
                                    window.open("https://twitter.com/intent/tweet?text=" +
                                        encodeURIComponent(getShareTwitterText()) +
                                        "&url=" + encodeURIComponent(window.location.href))
                                }
                                }>Share on Twitter</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div >
}

export default Head