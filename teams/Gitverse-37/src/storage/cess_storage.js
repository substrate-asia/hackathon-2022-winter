#!/usr/bin/env zx

import {$} from "zx";
import axios from 'axios';
import process from 'process';
import dotenv from 'dotenv'

import FormData from 'form-data';
import fs from 'fs';

let URL;
let Authorization;
let Account;

function parseClientEnv() {
    dotenv.config()
    URL = process.env.NETWORK_GATEWAY
    Authorization = process.env.Authorization
    Account = process.env.Account
}

// Create a bucket named repository name when Initialize the gitverse code repository
export async function createBucket(bucket) {
    try {
        parseClientEnv()

        let instance = axios.create({
            baseURL: URL
        })
        instance.defaults.headers.common['Authorization'] = Authorization
        const res = await instance.put(bucket, {}, {})
        if (!res) {
            console.error(`create bucket(${bucket}) fail`)
        }
    } catch (err) {
        console.error(err)
    }
}

// Upload the code to the bucket named gitverse repository name
export async function uploadFileToStorageProvider(bucket, file) {
    console.log("storage provider is <cess_storage>")

    let response;
    try {
        parseClientEnv()
        const url = `${URL}/${file}`

        // method 1 use curl command
        const response = await ($`curl -s -X PUT ${url}  -F 'file=@${file};type=application/octet-stream' -H "Authorization: ${Authorization}" -H "BucketName: ${bucket}"`.quiet())
        console.log("===> fid:", response.toString())
        return response.toString()

        // method 2 use api interface
 /*       const form = new FormData();
        form.append('type', "type=application/octet-stream")
        form.append('file', fs.readFileSync(file))

        response = await axios.put(
            url,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': Authorization,
                    'BucketName': bucket
                }
            }
        );
        console.log("===>>fid:", response.data['Block hash:'])
        return response.data['Block hash:']*/
    } catch (err) {
        console.error(err)
    }
}

export async function deleteBucket(bucket) {
    try {
        const url = `${URL}/${bucket}`
        const res = await axios.delete(url, {
            headers: {
                'Authorization': Authorization
            }
        })
        console.log("delete res=", res.data)
        return res.data
    } catch (err) {
        console.error(err)
    }
}

export async function listBucket() {
    try {
        const url = `${URL}/*`

        const res = await axios.get(url, {
            headers: {
                'Account': Account
            }
        })
        console.log(res.data)
    } catch (err) {
        console.error(err)
    }
}

// download file success
export async function downloadFile(fid) {
    try {
        const url = `${URL}/${fid}`
        const res = await axios.get(url, {
            headers: {
                'Operation': 'download'
            }
        })
        console.log(res.data)
        return res.data
    } catch (err) {
        console.error(err)
    }
}

// view file success
// 用这个api接口判断文件是否真是存在cess，已删除的文件，download还可以正常下载，但view提示不存在
export async function viewFile(fid) {
    try {
        const url = `${URL}/${fid}`
        const res = await axios.get(url, {
            headers: {
                'Operation': 'view'
            }
        })
        console.log("view=", res.data)
        return res.data
    } catch (err) {
        console.error(err)
    }
}

// delete file success
export async function deleteFile(fid) {
    try {
        const url = `${URL}/${fid}`
        const res = await axios.delete(url, {
            headers: {
                'Authorization': Authorization
            }
        })
        console.log("delete res=", res.data)
        return res.data
    } catch (err) {
        console.error(err)
    }
}