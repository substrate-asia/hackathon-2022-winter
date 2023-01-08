#!/usr/bin/env zx

import {Blob, NFTStorage} from 'nft.storage'
import fs from 'fs'
import dotenv from "dotenv";
import process from "process";

let NFT_STORAGE_TOKEN;
let client;

function parseClientEnv() {
    dotenv.config()
    NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN
    client = new NFTStorage({token: NFT_STORAGE_TOKEN})
}

export async function uploadFileToStorageProvider(repo_name, tag_file) {
    console.log("storage provider is <nft_storage>")

    let fil = fs.readFileSync(tag_file);
    var data = new Blob(fil);
    const repoCid = await storeBlob(data);
    if (!repoCid) {
        console.error("store tag file error!")
        process.exit();
    }

    const basicPrice = '0.01'
    const description = 'a new version of my pkg'
    const inviteCommission = 1
    const _inviteCommission = inviteCommission * 100
    let _properties = {
        basicPrice,
        inviteCommission: _inviteCommission,
    }
    const metadata = {
        "description": description,
        "image": repoCid,
        "properties": _properties,
    }

    const metadataCID = await storeJson(metadata)
    return metadataCID
}

const storeJson = async (data) => {
    const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
    })
    return storeBlob(blob)
}

const storeBlob = async (file) => {
    parseClientEnv()

    return await client.storeBlob(file)
}