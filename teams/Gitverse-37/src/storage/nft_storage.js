#!/usr/bin/env zx

import {$} from "zx";
import { NFTStorage, File, Blob } from 'nft.storage'
import fs from 'fs'

const NFT_STORAGE_TOKEN
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGI0RDk1ZDhmRGU4MTQ2RjREY2EyQTE2MTMyMTNBYTVmRjk5YzZhRmEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3MjEzNzE5OTgxNiwibmFtZSI6ImdpdHZlcnNlIn0.WPzW-Ryoy_bjxr-bMbBHnRvBr2NetxXT6YOA-iUBXBM'
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

export async function storeTagCode (tag_file) {
    console.log("storage provider <<nft_storage>>")

    let fil = fs.readFileSync(tag_file);
    var data = new Blob(fil);

    const repoCid = await storeBlob(data);
    if (!repoCid){
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
  return await client.storeBlob(file)
}