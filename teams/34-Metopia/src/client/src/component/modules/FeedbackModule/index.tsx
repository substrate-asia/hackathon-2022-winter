import React, { CSSProperties, useMemo, useState } from 'react';
import { toast, useAlertModal } from '../../modals/AlertModal';
import { MainButton } from '../../button';
import { FormGroup, ImageSelector, Input, Label, Textarea } from '../../form';
import { cdnPrefix, testApi } from '../../../config/urls';
import { uploadImg } from '../../../utils/imageUtils';
import './index.scss';
import { useWallet } from '../../../config/redux';


const FeedbackModule = (props: { isShow, onClose, initialStyle: CSSProperties, displayState: CSSProperties }) => {
    const { isShow, initialStyle, displayState, onClose } = props

    const [email, setEmail] = useState("")
    const [description, setDescription] = useState("")
    const [imgUrls, setImgUrls] = useState([])
    const [wallet, connect] = useWallet()
    const account = wallet?.address

    const { display: alert } = useAlertModal()

    return <div className='feedback-module' style={isShow ? displayState : initialStyle}>
        <div className='head'>
            <div className='text'>Feedback & Bug report</div>
            <img src="https://oss.metopia.xyz/imgs/close.svg" className='close-button' onClick={onClose} alt=""/>
        </div>
        <div className='body'>
            <FormGroup>
                <Label required>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormGroup>
            <FormGroup>
                <Label required>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormGroup>
            <FormGroup >
                <Label>Screenshot</Label>
                <div className='image-container'>
                    <ImageSelector imgUrl={""} onChange={(files) => {
                        if (!files?.length)
                            return
                        uploadImg(files[0]).then(result => {
                            if (!result?.content?.length) {
                                alert("Image upload failed", "Please check your network.")
                                return
                            }
                            setImgUrls([...imgUrls, cdnPrefix + result.content])
                        }).catch(e => {
                            alert("Image upload failed", "Please check your network.")
                        })

                    }} />
                    {
                        imgUrls.map((d, i) => {
                            return <div className='image-wrapper' key={`img${i}`} onClick={e => {
                                setImgUrls(imgUrls.filter(f => f != d))
                            }}>
                                <img src={d} className="image" alt=""/>
                            </div>
                        })
                    }
                </div>
            </FormGroup>
        </div>
        <div className='footer'>
            <MainButton onClick={() => {
                if (!account?.length) {
                    connect()
                    return
                }
                if (description?.length < 4) {
                    alert("Failed to submit", "Please provide the description")
                    return
                }
                fetch(testApi.feedback_create,
                    {
                        method: 'post',
                        body: JSON.stringify(Object.assign({}, { email, description, imgUrls, wallet: account }, { account }))
                    }).then(r => r.json()).then(r => {
                        toast("Thank you for the support!")
                        onClose()
                    }).catch(e => {
                        alert("Failed")
                    })
                // onSubmit({ email, description, imgUrls, wallet: account })
            }}>Submit</MainButton>
        </div>
    </div>
}

export default FeedbackModule