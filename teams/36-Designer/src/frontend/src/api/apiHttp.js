import request from "./request";

export function Auth(obj){
    return request.post('/auth',obj);
}

export function Upload(fileData){
    const { name } =fileData;
    console.error(fileData)
    const formData = new FormData();
    formData.append("file", fileData);
    return request.put(`/${name}`, formData);
}