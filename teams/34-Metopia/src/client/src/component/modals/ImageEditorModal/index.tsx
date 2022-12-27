import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import React, { useMemo, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import { getCroppedImg, type Area } from '../../../utils/imageUtils';
import { HollowButton, MainButton } from '../../button';
import './index.scss';

const imageEditorStyle = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        // width: '752px', height: '661px',
        width: '400px',
        // height: '358px',
        transform: 'translate(-50%, -50%)',
        background: '#15182B',
        borderRadius: '8px',
        overflow: 'hidden',
        border: 0
    }
}

const ImageEditorModal = (props: { onSubmit, isShow, onRequestClose, width?: number, height?: number }) => {
    const { onSubmit, isShow, width, height, onRequestClose } = props
    const imageInput = useRef<HTMLInputElement | null>()
    const [img, setImg] = useState<File | null>()
    const [scale, setScale] = useState(100)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()

    const modalWidth = Math.max(400, (width || 0) + 48) + 'px'
    let modalStyle = imageEditorStyle
    if (modalWidth)
        modalStyle.content.width = modalWidth
        
    const submit = async () => {
        if (!img) {
            return
        }
        const croppedImage = await getCroppedImg(
            imgObjectUrl,
            croppedAreaPixels
        )
        let blob = await fetch(croppedImage as string).then(r => r.blob());
        onSubmit(croppedImage, blob)
        onRequestClose()
    }

    const imgObjectUrl = useMemo(() => {
        return img && window.URL.createObjectURL(img)
    }, [img])

    return <Modal appElement={document.getElementById('root')}
        isOpen={isShow}
        onRequestClose={onRequestClose}
        style={modalStyle}>
        <div className="image-editor-modal-container">
            <div className="head">Image editor</div>
            <div className='body'>
                <div className={"main-container" + (img ? '' : ' empty')}
                    onClick={() => {
                        if (!img && imageInput.current) imageInput.current.click()
                    }} style={{ width: width + 'px', height: height + 'px' }}
                >
                    <Cropper
                        objectFit="horizontal-cover"
                        style={{
                            // containerStyle: { backgroundColor: 'rgba(255,255,255,0.6)' }, mediaStyle: { backgroundColor: 'rgba(255,255,255,1)' },
                        }}
                        // showGrid={false}
                        image={imgObjectUrl}
                        crop={crop}
                        zoom={scale / 100}
                        aspect={width && height ? width / height : 4}
                        onCropChange={(v) => {
                            setCrop(v)
                        }}
                        onCropComplete={(croppedArea, croppedAreaPixels) => {
                            setCroppedAreaPixels(croppedAreaPixels)
                        }}
                        // objectFit="auto-cover"   
                        onZoomChange={setScale}
                    />
                    <input className='Hidden' type={'file'} ref={imageInput} onBlur={() => { }} onChange={(e) => {
                        if (e.target.files[0]) {
                            setCrop({ x: 0, y: 0 })
                            setCroppedAreaPixels(null)
                            // setCroppedImage(null)
                            setImg(e.target.files[0])
                        }
                    }} />
                    {img ? null : <img className="uploader-icon" src={"https://oss.metopia.xyz/imgs/upload-pink.svg"} alt='Upload' />}
                </div>
                <div className="slider-container"  >
                    <div className="wrapper">
                        <Slider
                            disabled={imgObjectUrl == null}
                            min={50} max={150} step={1} onChange={(value) => value !== 100 && setScale(value)} defaultValue={scale}
                            trackStyle={{ backgroundColor: imgObjectUrl ? '#E6007A' : 'lightgray', height: '6px' }}
                            railStyle={{ height: '6px', background: imgObjectUrl ? '#F8F7FC' : 'lightgray' }}
                            handleStyle={{
                                width: '16px', height: '16px', border: '0', marginTop: '-5px', borderRadius: '10px',
                                background: imgObjectUrl ? '#FFFFFF' : 'gray',
                                boxShadow: '0px 0.357143px 2.85714px rgba(72, 69, 94, 0.24), 0px 4.28571px 9.28571px rgba(72, 69, 94, 0.12)'
                            }} />
                    </div>
                </div>
            </div>
            <div className="button-container">
                <HollowButton style={{ marginRight: '20px' }} onClick={() => {
                    imageInput.current.click()
                }}>Select image</HollowButton>
                <MainButton solid onClick={submit}>Apply</MainButton>
            </div>
        </div>
    </Modal>
}



export default ImageEditorModal