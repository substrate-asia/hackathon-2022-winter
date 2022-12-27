
import React, { useMemo } from 'react'
import { useWallet } from '../../../config/redux'
import { OnClickFuncType } from '../../../config/type/docTypes'
import { localRouter } from '../../../config/urls'
import { useAccountData } from '../../../core/accountApiHooks'
import { HollowButton } from '../../button'
import { Tip } from '../../form'
import { StandardAvatar } from '../../image'
import { useAlertModal } from '../../modals/AlertModal'
import './index.scss'

const LogoIcon = (props: { src: string, onClick?: OnClickFuncType }) => {
    return <div className={"logo-icon-wrapper"} onClick={props.onClick || function () { window.location.href = localRouter('home') }}>
        <img src={props.src} alt='' />
    </div >
}

const MenuItem = (props: { name: string, link: string, active?: any }) => {
    const { name, link, active } = props
    return <a className={"menu-item" + (active ? ' active' : '')} href={link} >{name}</a >
}

const menuItems = [
    {
        name: 'Home',
        link: localRouter('home'),
    }, {
        name: 'Add',
        link: localRouter('dao.create')
    }, {
        name: 'Profile',
        link: localRouter('profile')
    }
]

const NetworkSelector = props => {
    const [wallet] = useWallet()
    const [account, chainId] = [, '0xzzzz']

    const onChange = (chain) => {
        if (chain != -2) {
            window.open("https://metopia.xyz")
        } else {
            window.open("https://kusama.metopia.xyz")
        }
    }

    const chainInfo = useMemo(() => {
        if (process.env.REACT_APP_POLKADOT) {
            return <><img src="https://oss.metopia.xyz/imgs/ksm-logo.svg" style={{ backgroundColor: '#A195FF' }} alt="" /><div className="text">Kusama</div></>
        }
        if (chainId === '0x1') {
            return <><img src="https://oss.metopia.xyz/imgs/ethereum.png" style={{ backgroundColor: '#A195FF' }} alt="" /><div className="text">Ethereum</div></>
        } else if (parseInt(chainId) == 5) {
            return <><img src="https://oss.metopia.xyz/imgs/ethereum.png" style={{ backgroundColor: '#aaa' }} alt="" /><div className="text">Georli</div></>
        } else if (parseInt(chainId) == 11155111) {
            return <><img src="https://oss.metopia.xyz/imgs/ethereum.png" style={{ backgroundColor: '#aaa' }} alt="" /><div className="text">Sepolia</div></>
        } else if (parseInt(chainId) == 0x89) {
            return <><div className='img-wrapper'>
                <img src="https://oss.metopia.xyz/imgs/polygon.svg" alt="" style={{ height: '18px', width: '18px' }} />
            </div>
                <div className="text">Polygon</div></>
        }
        else if (parseInt(chainId) == 56) {
            return <>
                <img src="https://oss.metopia.xyz/imgs/bsc.svg" alt="" />
                <div className="text">BNB Chain</div>
            </>
        }

        else {
            return <><img src="https://oss.metopia.xyz/imgs/error-fill.svg" alt="" /><div className="text">Wrong network</div></>
        }
    }, [chainId])

    return <div className='network-selector'>
        <div className='value'>
            {chainInfo} <img src="https://oss.metopia.xyz/imgs/chevron.svg" alt="" style={{ height: '16px', marginRight: 0 }} />
            {/* <img src="https://oss.metopia.xyz/imgs/ethereum.png" /><div className="text">Ethereum</div> */}
        </div>
        <div className='drop-down'>
            <Tip>Select a network</Tip>
            <div className="option" onClick={() => onChange(1)}>
                <img src="https://oss.metopia.xyz/imgs/ethereum.png" style={{ backgroundColor: '#A195FF' }} alt="" />
                <div className="text">Ethereum</div>
            </div>
            <div className="option" onClick={() => onChange(0x89)}>
                <div className='img-wrapper'>
                    <img src="https://oss.metopia.xyz/imgs/polygon.svg" alt="" />
                </div>
                <div className="text">Polygon</div>
            </div>
            <div className="option" onClick={() => onChange(56)}>
                <img src="https://oss.metopia.xyz/imgs/bsc.svg" alt="" />
                <div className="text">BNB Chain</div>
            </div>
            <div className="option" onClick={() => onChange(-2)}>
                <img src="https://oss.metopia.xyz/imgs/ksm-logo.svg" alt="" />
                <div className="text">Kusama</div>
            </div>
        </div>
    </div>
}

const Menu = (props) => {
    const { active } = props
    const [wallet, connect, disconnect] = useWallet()

    const [account, chainId] = [wallet?.address, "0xzzzz"]

    const { data: userAccount } = useAccountData(account)

    const gotoProfile = () => {
        if (userAccount?.owner) {
            window.location.href = localRouter('profile')
        } else {
            window.location.href = localRouter('profile.edit', { slug: account })
        }
    }

    return <div className="menu-bar">
        <div className='container'>
            <div onClick={() => { window.location.href = localRouter('home') }} className="logowrapper">
                <img src={"https://oss.metopia.xyz/imgs/metopia-logo.svg"} alt='' />
            </div >
            <div className="menu-item-container" style={{ display: 'none' }}>
                {
                    menuItems && menuItems.map((i, j) => {
                        return <MenuItem {...i} key={'menuitem' + i.name} active={active === j + 1} />
                    })
                }
            </div>
            <div className='account-info-container'>
                {
                    !account ? <HollowButton onClick={() => {
                        connect()
                    }}>Connect wallet</HollowButton> :
                        (<>
                            <NetworkSelector />
                            <div className='avatar-wrapper' onClick={gotoProfile}>
                                <StandardAvatar height={32} user={userAccount?.owner ? userAccount : { owner: account }} />
                                <div className='drop-down'>
                                    <div className="option" onClick={gotoProfile}>
                                        <img src="https://oss.metopia.xyz/imgs/profile-w.svg" />
                                        <div className='text'>Profile</div>
                                    </div>
                                    <div className="option" onClick={(e) => {
                                        disconnect()
                                        localStorage.setItem("disconnect", 'true')
                                        e.stopPropagation()
                                    }}>
                                        <img src="https://oss.metopia.xyz/imgs/exit.svg" />
                                        <div className='text'>Disconnect</div></div>
                                </div>
                            </div>
                        </>)
                }
            </div>
        </div>
    </div >
}


export { Menu, MenuItem, LogoIcon }

