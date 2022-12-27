import request from "./request";

export function InitHandler(mnemonic){
    return request.post('mellon',{
        // "mnemonicWords": mnemonic
        "mnemonicWords": "seed laundry smoke stereo legend ecology obtain scheme auction ride family what"
    });
}
export function Index(){
    return request.get('index');
}

export function NewSite(name){
    return request.post('site',{
        "name":name
    });
}
export function SubscribeSite(id){
    return request.post('subscribe_site',{
        "metaFileId":id
    });
}

export function getSiteList(id){
    return request.get(`site_medias/${id}`);
}

export function Upload(obj){
    return request.post(`upload`,obj);
}
