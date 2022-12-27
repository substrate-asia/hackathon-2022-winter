#! /usr/bin/env zx
import * as u8a from "uint8arrays";
import {$} from "zx";
import { NFTStorage, File, Blob } from 'nft.storage'
import fs from 'fs'
import { ethers } from 'ethers';
import process from 'process';
import * as theAbi from './abi.json' assert { type: "json" };
import dotenv from 'dotenv'
dotenv.config()

const abi = theAbi.default

const tag_name = (await $`git tag|tail -1|xargs echo -n`).stdout; //获取到最后一个标签名,没有标签名抛出错误
if (!tag_name){
  console.log("Your project have no tags yet.")
  process.exit();
}
// const files = (await $`git ls-files -- . ':!:node_modules/*'`).stdout; //获取当前标签下所有文件的列表
const repo_path = (await $`git rev-parse --show-toplevel`).stdout;
const repo_name = await $`basename ${repo_path}|xargs echo -n`
const output_file_name = `${repo_name}-${tag_name}.tar.gz`

await $`git archive ${tag_name} --format=tar.gz --output ${output_file_name}`

let f = fs.readFileSync(output_file_name);
var someData = new Blob(f);

const NFT_STORAGE_TOKEN
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDIxMmZkRTRBOEFhY0RCZWE3RWFkRGNFMGU1NkI0NTFDQzdlNTM2QjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NzM4MTgzMDU2MywibmFtZSI6Ik5UQiJ9.Yj9ie65LXh6t6QECtGzKViX-AeTiAHnVoYybY3qfqNk'
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

async function checkExist(file) {
  try {
    const {cid} = await NFTStorage.encodeBlob(file)
    const isExist = await client.check(cid)
    if (isExist) {
      return {
        cid: `ipfs://${cid}`,
      }
    }
  } catch (err) {
    // nothing todo, as the file just do not store yet
    return false
  }
}


const storeBlob = async (file) => {
  const cid = await client.storeBlob(file)
  return `ipfs://${cid}`
}

// const repoCid =  await storeBlob(someData);
// if (!repoCid){
//   console.log("store file error!")
//   process.exit();
// }

const repoCid = 'ipfs://bafkreicghjvqwyan23izgowr3gcbarafnc2llm3rfkopxv3twlft6a4eby'

const storeJson = async (data) => {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    })
    return storeBlob(blob)
  }

const name = repo_name
const basicPrice = '0.01'
const description = 'a new version of my pkg'
const _basicPrice = ethers.utils.parseEther(basicPrice)
const inviteCommission = 1
const _inviteCommission = inviteCommission * 100
let _properties = {
  basicPrice,
  inviteCommission: _inviteCommission,
}

const metadata = {
  name,
  description,
  image: 'ipfs://bafkreigjrzq2uitilbkyqzl3ymhiyg4psytighyh5k7syvpftby64cspdq',
  properties: _properties,
}

const metadataCID = await storeJson(metadata)
// const metadataCID = 'ipfs://bafkreiaf6mean377xulltz3oflghuzbqzv7np33ja4akzydfqujpveo6xq'
console.log(`====> metadataCID :`, metadataCID)
/* 合约交互 */

const chainMap = {
  '0x13881': {
    chainId: '0x13881',
    chainName: 'Polygon Testnet Mumbai',
    blockExplorerUrls: [
      'https://mumbai.polygonscan.com/',
    ],
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: [
      'https://matic-mumbai.chainstacklabs.com',
      'https://rpc-mumbai.maticvigil.com',
      'https://matic-testnet-archive-rpc.bwarelabs.com',
    ],
  },
}

const provider = new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com', 0x13881)
const privKey = process.env.PRIVATE_KEY
const privKeyBuffer = u8a.fromString(privKey, "base16");
const wallet = new ethers.Wallet(privKeyBuffer, provider);
const contractAddress = '0xc61Ac59345150b0728ab3266766528C6e4aCbB75';
const contractWriter = new ethers.Contract(contractAddress, abi, wallet);

const value = ethers.utils.parseEther('0.01');
const gasPrice = ethers.utils.parseUnits('50', 'gwei');
const tx = await contractWriter.addPkg(_basicPrice, _inviteCommission, metadataCID, { value, gasPrice })
const rc = await tx.wait()
// const event = rc.events.find(event => event.event === 'AddPkg')
// const rz = event.args
// const tokenId = rz.tokenId.toString()
console.log(`====> tokenId : https://mumbai.polygonscan.com/tx/${tx.hash}`)

await $`rm ${output_file_name}`
