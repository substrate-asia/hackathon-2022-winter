
import { snapshotApi } from '../config/urls'

const createImage = url =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', error => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

export declare type Area = {
    width: number;
    height: number;
    x: number;
    y: number;
};

export async function getCroppedImg(imageSrc: string, pixelCrop: Area) {
    const image = (await createImage(imageSrc)) as CanvasImageSource
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    // As Base64 string
    // return canvas.toDataURL('image/jpeg');

    // As a blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(file => {
            resolve(window.URL.createObjectURL(file))
        }, 'image/jpeg')
    })
}

function getBase64Image(img: any) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL
}

export const uploadAvatarImg = (image: File) => {
    let headers = new Headers();
    const formData = new FormData();
    formData.append('image', image);

    const options = {
        method: 'POST',
        body: formData,
        headers: headers
    };

    return fetch(snapshotApi.uploadImageAvatar, options).then(res => res.json());
}

export const uploadImg = (image: File) => {
    let headers = new Headers();
    const formData = new FormData();
    if (image)
        formData.append('image', image);
    const options = {
        method: 'POST',
        body: formData,
        headers: headers
    };

    return fetch(snapshotApi.uploadImage, options).then(res => res.json());
}