#!/usr/bin/env zx
import {$} from "zx";
import { ethers } from 'ethers';
import * as etherAbi from './ether_abi.json' assert { type: "json" };
import * as factoryAbi from '../moonbean/factory_abi.json' assert { type: "json" };
import * as projectAbi from '../moonbean/project_abi.json' assert { type: "json" };
import process from 'process';
import dotenv from 'dotenv'

let RPC_URL;
let CHAIN_ID;
let CHAIN_NAME;
let PRIVATE_KEY;
let FACTORY_CONTRACT_ADDRESS;

function parseClientEnv() {
    dotenv.config()
    URL = process.env.NETWORK_GATEWAY
    RPC_URL = process.env.RPC_URL
    CHAIN_ID = process.env.CHAIN_ID
    CHAIN_NAME = process.env.CHAIN_NAME
    PRIVATE_KEY = process.env.PRIVATE_KEY
    FACTORY_CONTRACT_ADDRESS = process.env.FACTORY_CONTRACT_ADDRESS
}

async function getWallet() {
    parseClientEnv()

    // 连接moonbean网络，网络不同可以尝试更换provider
    // const providerURL = 'https://moonbase-alpha.public.blastapi.io';
    const providerURL = 'https://moonbeam-alpha.api.onfinality.io/public';
    // const providerURL = RPC_URL
    // const providerURL = 'https://rpc.api.moonbase.moonbeam.network';
    const provider = new ethers.providers.StaticJsonRpcProvider(providerURL, {
        chainId: Number(CHAIN_ID),
        name: CHAIN_NAME
    });

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    return wallet
}

async function getContract(contractType, contractAddress) {
    let abi = ""

    // 连接moonbean网络
    if (contractType == "factory") {
        abi = factoryAbi.default
    }
    if (contractType == "project") {
        abi = projectAbi.default
    }
    const wallet = await getWallet()
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    return contract
}

// 创建project代码仓库对应智能合约
export async function createGitRepoContract(gitRepoContractName) {
    parseClientEnv()
    const factoryContract = await getContract("factory", FACTORY_CONTRACT_ADDRESS)
    const tx = await factoryContract.createContract(gitRepoContractName)
    console.log(`===> create ${gitRepoContractName} repo contract success : https://moonbase.moonscan.io/tx/${tx.hash}`)
}

export async function getGitRepoContractAddr(gitRepoContractName) {
    parseClientEnv()

    const factoryContract = await getContract("factory", FACTORY_CONTRACT_ADDRESS)
    const porjectContractAddress = await factoryContract.getAddress(gitRepoContractName)
    return porjectContractAddress
}

export async function uploadGitRepoToContract(repo_name, metadataCID) {
    const value = ethers.utils.parseEther('0.001');
    const gasPrice = ethers.utils.parseUnits('1', 'gwei');

    const projectContractAddr = await getGitRepoContractAddr(repo_name)
    const projectContract = await getContract("project", projectContractAddr)

    const addr = []
    const tx = await projectContract.addPkg(metadataCID, addr, addr, {value: value, gasPrice: gasPrice})

    console.log(`===> upload ${repo_name} repo success: https://moonbase.moonscan.io/tx/${tx.hash}`)
}