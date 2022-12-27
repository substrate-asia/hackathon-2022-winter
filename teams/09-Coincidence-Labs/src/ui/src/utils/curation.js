import { ethers } from  'ethers'
import { u8arryToHex } from './helper'
import { getEthWeb } from "./web3/web3";
import { waitForTx } from './ethers'
import { CURATION_CONTRACT, errCode, EVM_CHAINS, RPC_NODE } from '@/config'
import { checkAccessToken, logout } from '@/utils/account'
import { newCuration as nc, newCurationWithTweet as ncwt, tipEVM as te, newPopup as npp, 
        likeCuration as lc, followCuration as fc, checkMyCurationRecord as ccr } from '@/api/api'

const abi = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "taskIds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "topCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxCount",
          "type": "uint256"
        }
      ],
      "name": "newTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_limit",
          "type": "uint256"
        }
      ],
      "name": "distribute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "taskInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "enum Task.TaskState",
              "name": "taskState",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "currentIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "topCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "feedTotal",
              "type": "uint256"
            }
          ],
          "internalType": "struct Task.TaskInfo",
          "name": "task",
          "type": "tuple"
        },
        {
          "internalType": "uint256",
          "name": "userCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "curationId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "popupTweetId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "winnerCount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "bonus",
          "type": "uint256"
        }
      ],
      "name": "createPopup",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
  ]

  /**
   * 
   * @param {*} curation
   *    uint256 curationId,
        uint256 endtime,
        address token,
        uint256 amount,
        uint256 topCount,
        uint256 maxCount 
   */
export const creteNewCuration = async (chainName, curation) => {
    return new Promise(async (resolve, reject) => {
        try{
            const curationContract = EVM_CHAINS[chainName].curation
            const metamask = await getEthWeb()
            const provider = new ethers.providers.Web3Provider(metamask)
            let contract = new ethers.Contract(curationContract, abi, provider)
            contract = contract.connect(provider.getSigner())
            const {curationId, endtime, token, amount, maxCount} = curation
            const tx = await contract.newTask(ethers.BigNumber.from('0x' + curationId), endtime, token, amount, 30, maxCount, {
              gasLimit: 500000
            })
            await waitForTx(provider, tx.hash)
            resolve(tx.hash)
        }catch(e) {
            console.log('create new curation fail:', e);
            reject(errCode.TRANSACTION_FAIL)
        }
    })
}

export const getCurationInfo = async (chainName, curationId) => {
  try {
    const curationContract = EVM_CHAINS[chainName].curation
    curationId = ethers.BigNumber.from('0x' + curationId);
    const provider = new ethers.providers.JsonRpcProvider(RPC_NODE)
    let contract = new ethers.Contract(curationContract, abi, provider)
    const info = await contract.taskInfo(curationId);
    return info;
  } catch (error) {
    console.log('Get curation info from chain fail:', error);
  }
}

export const claimReward = async (curationId) => {
  try {
    const metamask = await getEthWeb()
    const provider = new ethers.providers.Web3Provider(metamask)
    let contract = new ethers.Contract(CURATION_CONTRACT, abi, provider)
    contract = contract.connect(provider.getSigner())

    const tx = await contract.distribute(ethers.BigNumber.from('0x' + curationId), 300)
    await waitForTx(provider, tx.hash);
    
  } catch(err) {

  }
}

export const randomCurationId = () => {
    let id = ethers.utils.randomBytes(6)
    id = u8arryToHex(id);
    return id;
}

export const createPopup = async (chainName, popup) => {
  return new Promise(async (resolve, reject) => {
    try{
        const popupContract = EVM_CHAINS[chainName].popup
        const metamask = await getEthWeb()
        const provider = new ethers.providers.Web3Provider(metamask)
        let contract = new ethers.Contract(popupContract, abi, provider)
        contract = contract.connect(provider.getSigner())
        const {curationId, popupTweetId, endTime, winnerCount, token, bonus} = popup
        const tx = await contract.createPopup(ethers.BigNumber.from('0x' + curationId), ethers.BigNumber.from(popupTweetId), endTime, winnerCount, token, bonus)
        await waitForTx(provider, tx.hash)
        resolve(tx.hash)
    }catch(e) {
        console.log('create new popup fail:', e);
        reject(errCode.TRANSACTION_FAIL)
    }
})
}


/**
 * 
 * @param {*} curation {twitterId, curationId, creatorETH, content, token, amount, maxCount, endtime, transHash,
 * tweetId, authorId, chainId, curationType, tasks, spaceId, hostIds, speakerIds, title,
 * startedAt, scheduledStart, endedAt, tweetContent, endTime,retweetInfo, retweetId, pageInfo, createdAt}
 * @returns 
 */
export const newCurationWithTweet = async (curation) => {
  await checkAccessToken();
  const tweets = await ncwt(curation)
  return tweets;
}

export const newPopups = async (popup) => {
  await checkAccessToken();
  const res = await npp(popup);
  return res;
}

/**
 * 
 * @param {*} curation {twitterId, curationId, creatorETH, content, token, amount, maxCount, endtime, transHash, chainId, tasks}
 * @returns 
 */
export const newCuration = async (curation) => {
  await checkAccessToken();
  const tweets = await nc(curation)
  return tweets;
}

export const tipEVM = async (tip) => {
  await checkAccessToken();
  const result = await te(tip)
  return result;
}

/**
 * 
 * @param {*} curation {twitterId, tweetId, curationId} 
 */
export const likeCuration = async (curation) => {
  await checkAccessToken();
  const { twitterId, tweetId, curationId } = curation
  try {
    const res = await lc(twitterId, tweetId, curationId)
    return res
  }catch(e) {
    if (e === 401) {
      await logout(twitterId)
      throw 'log out'
    }
    throw e
  }
}

/**
 * 
 * @param {*} curation {twitterId, authorId, curationId}
 */
export const followCuration = async (curation) => {
  await checkAccessToken();
  const { twitterId, authorId, curationId } = curation
  try {
    const res = await fc(twitterId, authorId, curationId)
    return res
  }catch(e) {
    if (e === 401) {
      await logout(twitterId)
      throw 'log out'
    }
    return false
  }
}

export const checkMyCurationRecord = async (twitterId, curationId) => {
   await checkAccessToken();
   try {
      const res = ccr(twitterId, curationId);
      return res;
   } catch (e) {
      if (e === 401) {
        await logout(twitterId);
        throw 'log out'
      }
   }
}