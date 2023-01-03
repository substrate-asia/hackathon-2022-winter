
import { ipfsApi } from '../config/urls'
import { pinataApiKey, pinataSecretApiKey } from '../config/constant'



export const uploadFileToIfps = (image: File) => {
    let headers = new Headers();
    headers.append("pinata_api_key", pinataApiKey)
    headers.append("pinata_secret_api_key", pinataSecretApiKey)
    const formData = new FormData();
    formData.append('file', image);

    const options = {
        method: 'POST',
        body: formData,
        headers: headers
    };

    return fetch(ipfsApi.pinata_pinFileToIPFS, options).then(res => res.json());
}
