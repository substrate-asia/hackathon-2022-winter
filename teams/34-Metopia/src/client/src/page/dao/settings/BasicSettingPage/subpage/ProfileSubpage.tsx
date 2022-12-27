import useSize from '@react-hook/size'

import React, { useEffect, useMemo, useState } from 'react'
import { CroppingImageSelector, FormGroup, Input, Label, Textarea, Tip } from '../../../../../component/form'
import UserInput from '../../../../../component/form/UserInput'
import { useAlertModal } from '../../../../../component/modals/AlertModal'
import { useLoadingModal } from '../../../../../component/modals/LoadingModal'
import { useWallet } from '../../../../../config/redux'
import { cdnPrefix } from '../../../../../config/urls'
import { syncSnapshotData } from '../../../../../third-party/snapshot'
import { uploadImg } from '../../../../../utils/imageUtils'
import { compareIgnoringCase } from '../../../../../utils/stringUtils'
import DaoHomeHead from '../../../HomePage/head'
import './ProfileSubpage.scss'

const ExternalLinkInputModule = props => {
    const { value, onChange } = props
    return <div className='external-link-input-module'>
        <div className="external-link-input-group" >
            <div className='label'>
                <img src={'https://oss.metopia.xyz/imgs/website_white.svg'} alt="" style={{ width: '24px', height: '24px' }} />
                <div className='text'>Website</div>
            </div>
            <input placeholder={"https://"} value={value.website} onChange={e => {
                let tmp = e.target.value
                if (tmp.startsWith("https://")) {
                    onChange({ website: tmp })
                } else {
                    onChange({ website: "https://" })
                }
            }} onBlur={e => {
                if (e.target.value == 'https://') {
                    onChange({ website: "" })
                }
            }} />
        </div>
        <div className="external-link-input-group" >
            <div className='label'>
                <img src={'https://oss.metopia.xyz/imgs/opensea_white.svg'} alt="" style={{ width: '24px', height: '24px' }} />
                <div className='text'>Opensea</div>
            </div>
            <input placeholder={"https://opensea.io/collection/"} value={value.opensea} onChange={e => {
                let tmp = e.target.value
                if (tmp.startsWith("https://opensea.io/collection/")) {
                    onChange({ opensea: tmp })
                } else {
                    onChange({ opensea: "https://opensea.io/collection/" })
                }
            }} onBlur={e => {
                if (e.target.value == 'https://opensea.io/collection/') {
                    onChange({ opensea: "" })
                }
            }} />
        </div >
        <div className="external-link-input-group" >
            <div className='label'>
                <img src={'https://oss.metopia.xyz/imgs/discord_white.svg'} alt="" style={{ width: '24px', height: '24px' }} />
                <div className='text'>Discord</div>
            </div>
            <input placeholder={"https://"} value={value.discord} onChange={e => {
                let tmp = e.target.value
                if (tmp.startsWith("https://")) {
                    onChange({ discord: tmp })
                } else {
                    onChange({ discord: "https://" })
                }
            }} onBlur={e => {
                if (e.target.value == 'https://') {
                    onChange({ discord: "" })
                }
            }} />
        </div >
        <div className="external-link-input-group" >
            <div className='label'>
                <img src={'https://oss.metopia.xyz/imgs/twitter_white.svg'} alt="" style={{ width: '24px', height: '24px' }} />
                <div className='text'>Twitter</div>
            </div>
            <input placeholder={"https://twitter.com/"} value={value.twitter} onChange={e => {
                let tmp = e.target.value
                if (tmp.startsWith("https://twitter.com/")) {
                    onChange({ twitter: tmp })
                } else {
                    onChange({ twitter: "https://twitter.com/" })
                }
            }} onBlur={e => {
                if (e.target.value == 'https://twitter.com/') {
                    onChange({ twitter: "" })
                }
            }} />
        </ div>
    </div >
}

const ProfileSubpage = props => {
    const { value, onChange, importFromSnapshot, setPage } = props
    const [cachedLocalAvatar, setCachedLocalAvatar] = useState(null)
    const [cachedLocalBanner, setCachedLocalBanner] = useState(null)

    const previewContainerRef = React.useRef(null)
    const [width, height] = useSize(previewContainerRef)

    const [wallet] = useWallet()
    const account = wallet?.address

    const [snapshotLink, setSnapshotLink] = useState(null)
    const [snapshotLinkError, setSnapshotLinkError] = useState(null)

    const { display: displayLoading, hide: hideLoading } = useLoadingModal()
    const { display: alert } = useAlertModal()
    const { display: loading, hide: unloading } = useLoadingModal()

    useEffect(() => {
        let url = snapshotLink
        if (!url || !url.trim().length)
            return
        let tmp = url.split("/")
        if (tmp.length < 5)
            return
        if (url.indexOf("https://snapshot.org/") !== 0) {
            setSnapshotLinkError("Please provide proper Snapshot link")
            return
        }

        displayLoading('Importing information from snapshot')

        syncSnapshotData(tmp[4]).then(({ basicFormData, consensusForm, votingForm }) => {
            onChange(basicFormData)
            setPage(2)
        }).catch(e => {

            alert("Failed to fetch data")
        }).finally(() => {
            hideLoading()
        })
    }, [snapshotLink])

    const cachedLocalAvatarObjectUrl = useMemo(() => {
        return cachedLocalAvatar && window.URL.createObjectURL(cachedLocalAvatar)
    }, [cachedLocalAvatar])
    const cachedLocalBannerObjectUrl = useMemo(() => {
        return cachedLocalBanner && window.URL.createObjectURL(cachedLocalBanner)
    }, [cachedLocalBanner])

    const handleScroll = () => {
        const scrollTop = window.pageYOffset;
        const ele = document.getElementById('profilePreviewWrapper')
        if (scrollTop > 190) {
            if (ele.style.position != 'fixed') {
                ele.style.position = 'fixed'
            }
        } else {
            if (ele.style.position == 'fixed') {
                ele.style.position = 'unset'
            }
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return <div className='profile-subpage subpage'>
        <div className='form' style={importFromSnapshot ? { display: 'none' } : null}>
            <FormGroup>
                <Label required>What is the name of your Space</Label>
                <Input placeholder={"Name"} value={value.name}
                    onChange={e => onChange({ name: e.target.value })} autoComplete="off" />
            </FormGroup>
            <FormGroup>
                <Label>Write a brief introduction</Label>
                <Textarea placeholder={"Introduce your Space to the community"}
                    value={value.about} onChange={e => onChange({ about: e.target.value })} />
            </FormGroup>
            <FormGroup>
                <Label required>Avatar</Label>
                <CroppingImageSelector width={100} height={100} croppingWidth={200} croppingHeight={200} imgUrl={cachedLocalAvatarObjectUrl || value.avatar} onChange={async (img, blob) => {
                    loading("The system is processing the image")
                    let result = await uploadImg(blob)
                    if (!result?.content?.length) {
                        window.alert("Image upload failed. Please check your network.")
                        return
                    }
                    setCachedLocalAvatar(blob)
                    onChange({ 'avatar': cdnPrefix + result.content })
                    unloading()
                }} />
            </FormGroup>
            <FormGroup>
                <Label>Banner</Label>
                <CroppingImageSelector wide croppingWidth={600} croppingHeight={150} imgUrl={cachedLocalBannerObjectUrl || value.banner} onChange={async (img, blob) => {
                    loading("The system is processing the image")
                    let result = await uploadImg(blob)
                    if (!result?.content?.length) {
                        window.alert("Image upload failed. Please check your network.")
                        return
                    }
                    setCachedLocalBanner(blob)
                    onChange({ 'banner': cdnPrefix + result.content })
                    unloading()
                }} />
                {/* <ImageSelector wide imgUrl={cachedLocalBannerObjectUrl || value.banner} onChange={async (e) => {
                    if (!e.target.files[0])
                        return
                    let result = await uploadImg(e.target.files[0])
                    if (!result?.content?.length) {
                        window.alert("Image upload failed. Please check your network.")
                        return
                    }
                    setCachedLocalBanner(e.target.files[0])
                    onChange({ 'banner': cdnPrefix + result.content })
                }} /> */}
            </FormGroup>
            <FormGroup>
                <Label>Links</Label>
                <Tip>(Not required)</Tip>
                <ExternalLinkInputModule value={value} onChange={onChange} />
            </FormGroup>

            <FormGroup style={{ width: '400px', overflow: 'visible' }}>
                <Label required={true}>Admins</Label>
                {
                    value.admins?.map((admin, i) => {
                        return <UserInput value={admin} short={true}
                            key={`UserInput${i}`}
                            onChange={newAdmin => {
                                onChange({ admins: value.admins.map((m, j) => i === j ? newAdmin : m) })
                            }} onAdd={() => {
                                onChange({
                                    admins: [...value.admins, '']
                                })
                            }} onDelete={value.admins.length > 1 && !compareIgnoringCase(account, admin) ? () => {
                                onChange({
                                    admins: value.admins.filter((m, j) => i !== j)
                                })
                            } : null} />
                    })
                }
            </FormGroup>

        </div>
        <div className='form' style={!importFromSnapshot ? { display: 'none' } : null}>
            <FormGroup>
                <Label required>Import Snapshot space settings</Label>
                <Input placeholder={"Input your Snapshot space link (e.g. https://snapshot.org/#/ens.eth)"}
                    value={snapshotLink || ""}
                    onChange={e => {
                        // if (e.target.value.indexOf("https") === 0)
                        if (snapshotLinkError)
                            setSnapshotLinkError(null)
                        setSnapshotLink(e.target.value)
                    }}
                    error={snapshotLinkError} />
            </FormGroup>
        </div>
        <div className='preview-container' ref={previewContainerRef} style={{
        }}>
            <div className='preview-wrapper' id="profilePreviewWrapper">
                <div className='title-wrapper'>
                    <div className='title'>Homepage preview</div>
                    <div className='subtitle'>Preview after filling in the information</div>
                </div>
                <DaoHomeHead {...value} editable={false} width={width} preview={true}
                    avatar={cachedLocalAvatarObjectUrl || value.avatar}
                    banner={cachedLocalBannerObjectUrl || value.banner}
                    name={value.name?.length ? value.name : 'Name'}
                    about={value.about?.length ? value.about : 'Introduction'}
                    className={(cachedLocalAvatar ? "" : " avatar-not-provided") + (cachedLocalBanner ? '' : ' banner-not-provided')} />
            </div>
        </div>
    </div>
}

export default ProfileSubpage