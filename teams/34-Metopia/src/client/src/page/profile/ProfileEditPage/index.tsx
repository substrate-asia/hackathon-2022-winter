
import { web3FromAddress } from '@polkadot/extension-dapp'
import React, { useEffect, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import { MainButton } from '../../../component/button'
import { FormGroup, Input, Label } from '../../../component/form'
import TipTap from '../../../component/form/richtext/TipTap'
import { StandardAvatar } from '../../../component/image'
import { useAlertModal } from '../../../component/modals/AlertModal'
import { useLoadingModal } from '../../../component/modals/LoadingModal'
import { useWallet } from '../../../config/redux'
import { cdnPrefix, discordApi, localRouter, removeThumbnail, twitterApi } from '../../../config/urls'
import { createAccount, updateAccount, useAccountData } from '../../../core/accountApiHooks'
import { usePersonalDiscordData } from '../../../third-party/discord'
import { useNfts } from '../../../third-party/moralis'
import { useTwitterData } from '../../../third-party/twitter'
import { uploadAvatarImg } from '../../../utils/imageUtils'
import { getNFTReadableSrc, getSortedNfts } from '../../../utils/nftUtils'
import { encodeQueryData } from '../../../utils/restUtils'
import './index.scss'
import NftSelectionModal from './NftSelectionModal'

const ProfileEditPage = props => {
    const { state, code, oauth_token, oauth_verifier } = props

    const [wallet, connect] = useWallet()
    const [account, chainId] = [wallet?.address, '0xzzzz']

    const [nonce, setNonce] = useState(1)
    const { data: accountData } = useAccountData(account, nonce)
    const { data: nfts } = useNfts(account, '0x1')

    const [introInput, setIntroInput] = useState(null)
    const [usernameInput, setUsernameInput] = useState(null)
    const intro = introInput || accountData?.introduction
    const username = usernameInput != null ? usernameInput : accountData?.username || ''
    const [modified, setModified] = useState(false)

    const { data: discordData } = usePersonalDiscordData(account, code)
    const { data: twitterData } = useTwitterData(account, oauth_token, oauth_verifier)

    const [selectedNftData, setSelectedNftData] = useState(null)
    const { display: displayLoadingModal, hide: hideLoadingModal } = useLoadingModal()
    const { display: alert } = useAlertModal()

    const [loading, setLoading] = useState(false)
    const [showAvatarSelectionModal, setShowAvatarSelectionModal] = useState(false)

    const [cookies] = useCookies(["referral"])

    useEffect(() => {
        if (discordData?.code == 55 && alert) {
            alert('Your discord is bounded with another account')
        }
    }, [discordData, alert])

    useEffect(() => {
        if (twitterData?.code == 55 && alert) {
            alert('Your twitter is bounded with another account')
        }
    }, [twitterData, alert])

    useEffect(() => {
        if (account?.length) {
        } else {
            connect()
        }
    }, [account, connect])

    useEffect(() => {
        if (account && accountData && !accountData.owner) {
            displayLoadingModal("Please sign for the information and initialize your account")
            createAccount(account, cookies.referral, wallet).then((e) => {
                setNonce(nonce + 1)
                console.log(e)
            }).catch(e => {
                console.log(e)
                // window.location.href = localRouter('home')
            }).finally(hideLoadingModal)
        }
    }, [account, accountData, cookies.referral, nonce, wallet, displayLoadingModal, hideLoadingModal])

    const sortedNfts = useMemo(() => {
        if (!nfts)
            return []

        let nftList = []
        if (nfts?.length) {
            nftList.push(...(nfts.map(item => {
                return Object.assign({}, item, { chainId: chainId })
            })))
        }

        return getSortedNfts(nftList)
    }, [nfts, chainId])

    const submit = async () => {
        try {
            let _username = username.trim()
            if (_username?.length < 1) {
                alert('Please provide your username')
                return
            }
            let _intro = intro.replace(
                /<p>|<[/]p>|<strong>|<[/]strong>|<u>|<[/]u>|<em>|<[/]em>/gi, "").trim()
            if (_intro?.length < 1) {
                alert('Please provide the introduction')
                return
            }
            let avatar = accountData?.avatar
            setLoading(true)
            if (selectedNftData) {
                avatar = selectedNftData.cachedUrl || getNFTReadableSrc(selectedNftData)
                displayLoadingModal("Please wait for avatar upload finishing")
                if (avatar.indexOf("https://ai.metopia.xyz/sbt-generator") === 0) {
                    avatar += '&type=png'
                }
                let res = await fetch(removeThumbnail(avatar).replace("http://metopia.oss-cn-hongkong.aliyuncs.com", "https://oss.metopia.xyz")
                    .replace('http://metopia.oss-cn-hongkong.aliyuncs.com', 'https://oss.metopia.xyz'))
                let blob = await res.blob()
                let type = res.headers.get('content-type')
                let file = new File([blob as any], selectedNftData.token_address + "-" + selectedNftData.token_id, { type });
                let newSrc = (await uploadAvatarImg(file)).content
                if (newSrc)
                    avatar = cdnPrefix + newSrc

                hideLoadingModal()
            }

            if (sortedNfts?.length && !avatar?.length) {
                alert('Please choose your avatar')
                setLoading(false)
                return
            }
            updateAccount(account, _username, avatar, intro, wallet).then(d => {
                if (document.referrer && (document.referrer.indexOf('http://localhost:3000/') == 0 || document.referrer.indexOf('https://ai.metopia.xyz') == 0 ||
                    document.referrer.indexOf('https://metopia.xyz') == 0)) {
                    window.history.back()
                } else {
                    window.location.href = localRouter('profile')
                }
            }).catch(e => {
                if (e !== 'continue')
                    alert('Failed')
            }).finally(() => {
                setLoading(false)
            })
        } catch (e) {
            setLoading(false)
            hideLoadingModal()
        }
    }

    const discordConnected = (accountData?.discordId && accountData?.discordId != '0') ||
        (discordData?.data?.discordId && discordData?.data?.discordId != '0')

    const twitterConnected = (accountData?.twitterUserId && accountData?.twitterUserId != '0') ||
        (twitterData?.data?.twitterUserId && twitterData?.data?.twitterUserId != '0')

    return <div className='profile-edit-page'>
        <div className="head">
            <span className='back-button'
                onClick={e => {
                    if (document.referrer && (document.referrer.indexOf('http://localhost:3000/') == 0 || document.referrer.indexOf('https://ai.metopia.xyz') == 0 ||
                        document.referrer.indexOf('https://metopia.xyz') == 0)) {
                        window.history.back()
                    } else {
                        window.location.href = localRouter('profile')
                    }
                }}
            ><img src="https://oss.metopia.xyz/imgs/back-button.svg" alt="back" title='back' /></span>
            <div className='title'>Edit profile</div>
        </div>
        <div className='body'>
            <FormGroup>
                <Label required>Choose your avatar</Label>
                <div className='avatar-input-wrapper' onClick={e => {
                    setShowAvatarSelectionModal(true)
                }}>
                    {
                        selectedNftData ? <img src={selectedNftData.cachedUrl} className={'avatar'} alt="" /> : <StandardAvatar user={accountData} height={96} className="avatar" />
                    }
                    <img className={"to-upload-icon" + (accountData?.avatar ? ' hidden' : '')} src={"https://oss.metopia.xyz/imgs/uploadv2.svg"} alt='Upload' />
                </div>
            </FormGroup>
            <FormGroup>
                <Label required>What's your username</Label>
                <Input value={username || ''} onChange={e => {
                    setUsernameInput(e.target.value)
                    setModified(true)
                }} />
            </FormGroup>
            <FormGroup>
                <Label>Get verified</Label>
                <div className="verify-button-container">
                    <div className='button-wrapper'>
                        <div className={"Button" + (twitterConnected ? ' verified' : '')}
                            onClick={e => {
                                if (!twitterConnected) {
                                    window.open(twitterData?.data?.redirect_uri)
                                }
                            }}>
                            <div className='container'>
                                <img src={twitterConnected ?
                                    'https://oss.metopia.xyz/imgs/twitter-verified.svg' : "https://oss.metopia.xyz/imgs/twitter-outline.svg"} alt="" />
                                <div className='text'>
                                    {twitterConnected ?
                                        (accountData?.twitterScreenName || twitterData?.twitterScreenName) :
                                        'Verify Twitter'}
                                    <img src="https://oss.metopia.xyz/imgs/chevron.svg"
                                        style={{ transform: 'rotate(-90deg) translateX(-1px)', display: twitterConnected ? 'none' : 'block' }} alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='button-wrapper'>
                        <div className={"Button" + (discordConnected ? ' verified' : '')}
                            onClick={e => {
                                !discordConnected && window.open(discordData?.data?.redirect_uri)
                            }}>
                            <div className='container'>
                                <img src={discordConnected ? 'https://oss.metopia.xyz/imgs/discord-verified.svg' : "https://oss.metopia.xyz/imgs/discord-outline.svg"} alt="" />
                                <div className='text'>
                                    {discordConnected ? (accountData?.discordName || discordData?.discordName) : 'Verify Discord'}
                                    <img src="https://oss.metopia.xyz/imgs/chevron.svg"
                                        style={{ transform: 'rotate(-90deg) translateX(-1px)', display: discordConnected ? 'none' : 'block' }} alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </FormGroup>
            <FormGroup>
                <Label required={true}>Introduce yourself</Label>
                <div className='RichText'>
                    {
                        accountData ?
                            <TipTap initialValue={accountData?.introduction || ''} onChange={(val) => {
                                setIntroInput(val)
                                if (!modified)
                                    setModified(true)
                            }} /> : null
                    }
                </div>
            </FormGroup>
            {
                accountData?.referral ?
                    <FormGroup>
                        <Label>Referral</Label>
                        <Input value={accountData.referral} disabled />
                    </FormGroup> : null
            }
        </div>
        <div className='footer'>
            <MainButton onClick={() => {
                if (document.referrer && (document.referrer.indexOf('http://localhost:3000/') == 0 || document.referrer.indexOf('https://ai.metopia.xyz') == 0 ||
                    document.referrer.indexOf('https://metopia.xyz') == 0)) {
                    window.history.back()
                } else {
                    window.location.href = localRouter('profile')
                }
            }} >Cancel</MainButton>
            <MainButton onClick={submit} disabled={!modified} loading={loading}>Save</MainButton>
        </div>
        <NftSelectionModal sortedNfts={sortedNfts}
            isShow={showAvatarSelectionModal}
            onHide={e => setShowAvatarSelectionModal(false)}
            onChange={(nft) => {
                setSelectedNftData(nft)
                setModified(true)
            }} />
    </div>
}

export default ProfileEditPage