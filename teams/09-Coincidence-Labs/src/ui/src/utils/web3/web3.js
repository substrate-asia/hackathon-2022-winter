import {
  sleep
} from "../helper"
import {
  CHAIN_ID,
  RPC_NODE,
  CHAIN_NAME,
  MainToken,
  BLOCK_CHAIN_BROWER,
  EVM_CHAINS
} from '@/config'
import store from '@/store'
import { ethers } from 'ethers'

/**
 * Add bsc to metamask
 * @returns 
 */
export const setupNetwork = async (chainName) => {
  await connectMetamask();
  const { id, rpc, scan, main } = EVM_CHAINS[chainName]
  const eth = await getEthWeb()
  try {
    const res = await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{
        chainId: `0x${id.toString(16)}`
      }],
    })
    // store.commit('web3/saveChainId', parseInt(id))
    return true
  } catch (error) {
    if (error.code === 4001) return;
    try{
      const n = await eth.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${id.toString(16)}`,
          chainName,
          rpcUrls:[rpc],
          nativeCurrency: main,
          blockExplorerUrls: [scan]
        }],
      })
      // store.commit('web3/saveChainId', parseInt(id))
      return true
    }catch(error){
      console.log(43256, error);
      store.commit('web3/saveAccount', null)
      return false
    }
  }
}

export const signMessage = async (message, address) => {
  const metamask = await getEthWeb()
  const provider = new ethers.providers.Web3Provider(metamask)
  const signer = provider.getSigner();
  if (await signer.getAddress() === address) {
    return await signer.signMessage(message)
  }
}

/**
 * Get metamask eth
 */
export const getEthWeb = async () => {
  if (typeof window.ethereum !== 'undefined') {
    if (!window.ethereum.isMetaMask) {
      console.log('Not metamask wallet');
    }
    if (window.ethereum.overrideIsMetaMask) {
      return window.ethereum.selectedProvider ?? window.ethereum.providers.find(p => p.isMetaMask)
    }
    return window.ethereum
  }
  var metamask = window.ethereum
  for (let i = 0; i < 10; i++) {
    if (typeof window.ethereum !== 'undefined') {
      if (window.ethereum.overrideIsMetaMask) {
        return window.ethereum.selectedProvider ?? window.ethereum.providers.find(p => p.isMetaMask)
      }
      return window.ethereum
    }
    await sleep(0.5)
  }
  
  return metamask
}

/**
 * Connect to Metamask
 */
export const connectMetamask = async () => {
  const metamask = await getEthWeb()
  const accounts = await metamask.request({
    method: 'eth_requestAccounts'
  });
  return accounts
}

/**
 * User changed chain
 */
export const chainChanged = async (refresh) => {
  const metamask = await getEthWeb()
  metamask.on('chainChanged', async(chainId) => {
    console.log('Changed to new chain', parseInt(chainId));
    store.commit('web3/saveChainId', parseInt(chainId))
    if (refresh)
      refresh();
  })
}

/**
 * Is metamask unlocked
 * @returns bool
 */
export const isUnlocked = async () => {
  const metamask = await getEthWeb()
  return await metamask._metamask.isUnlocked()
}

/**
 * Monitor metamask lock state
 * @param {*} refresh 
 */
export const lockStatusChanged = async (refresh) => {
  while(true) {
    await sleep(3)
    if (await isUnlocked()){
    }else{
      store.commit('saveMetamaskConnected', false)
      if(!store.state.web3.account) continue;
      store.commit('web3/saveAccount', null)
      refresh()
      break;
    }
  }
}

/**
 * Add asset to metamask
 */
 export const addAssetToWallet = async (address, symbol, decimals, image) => {
  const metamask = await getEthWeb()
  metamask.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address,
        symbol,
        decimals,
        image
      }
    }
  }).then((success) => {
    if (success) {
      console.log(symbol, 'successfully added to wallet!');
    } else {
      console.log('Add asset faild');
    }
  }).catch(console.log)
}