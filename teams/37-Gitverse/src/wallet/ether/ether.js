#!/usr/bin/env zx
import * as u8a from "uint8arrays";
import {$} from "zx";
import { ethers } from 'ethers';
import * as etherAbi from './ether_abi.json' assert { type: "json" };
import * as factoryAbi from '../moonbean/factory_abi.json' assert { type: "json" };
import * as projectAbi from '../moonbean/project_abi.json' assert { type: "json" };
import process from 'process';
import dotenv from 'dotenv'

dotenv.config()

const factoryAddress = "0xd6bC22CBe64Ef84b9bd0015BA06C67aEA134D13f"
const privKey = "bfa2ffc9fbbff9061ec5abfa841a559aec3051a95db534934ebc9faebb5cb2bd"

async function getWallet() {
    // 连接moonbean网络，网络不同可以尝试更换provider
    // const providerURL = 'https://moonbase-alpha.public.blastapi.io';
    const providerURL = 'https://moonbeam-alpha.api.onfinality.io/public';
    // const providerURL = 'https://rpc.api.moonbase.moonbeam.network';

    const provider = new ethers.providers.StaticJsonRpcProvider(providerURL, {
        chainId: 1287,
        name: 'moonbase-alphanet'
    });
    
    // const privKeyBuffer = process.env.PRIVATE_KEY
    // const privKeyBuffer = u8a.fromString(privKey);
    const wallet = new ethers.Wallet(privKey, provider);

    return wallet
}

async function getContract(contractType, contractAddress) {
    let abi = ""
    
    // 连接moonbean网络
    if (contractType == "factory"){
      abi = factoryAbi.default
    }
    if (contractType == "project"){
      abi = projectAbi.default
    } 
    const wallet = await getWallet()
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    return contract
}

// 创建project代码仓库对应智能合约
export async function createGitRepoContract(gitRepoContractName) {
  const factoryContract =await getContract("factory", factoryAddress)
  const tx = await factoryContract.createContract(gitRepoContractName)
  console.log(`====> create ${gitRepoContractName} repo contract success : https://moonbase.moonscan.io/tx/${tx.hash}`)
}

export async function getGitRepoContractAddr(gitRepoContractName) {
  const factoryContract =await getContract("factory", factoryAddress)
  const porjectContractAddress = await factoryContract.getAddress(gitRepoContractName)
  return porjectContractAddress
}

export async function uploadGitRepoToContract(repo_name, metadataCID) {
    const value = ethers.utils.parseEther('0.001');
    const gasPrice = ethers.utils.parseUnits('1', 'gwei');

    const projectContractAddr = await getGitRepoContractAddr(repo_name)
    const projectContract =await getContract("project", projectContractAddr)

    const addr= [] 
    const tx = await projectContract.addPkg(metadataCID, addr, addr, {value: value, gasPrice: gasPrice})
    console.log(`====> upload ${repo_name} repo success: https://moonbase.moonscan.io/tx/${tx.hash}`)
}