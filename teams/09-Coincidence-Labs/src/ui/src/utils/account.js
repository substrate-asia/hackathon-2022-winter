import { getUserInfo as gui, getNftReceivedState, getUsersTips as gut, logout as lo, twitterRefreshAccessToken } from '@/api/api'
import store from '@/store'
import { sleep } from '@/utils/helper'

/**
 * Fetch account info from backend
 * This define the status of account
 */
export const FetchingStatus = {
    NOT_REGISTED: 0,
    MATCH_TICKETS: 1,
    REGISTERING: 2,
    MATCH_ACCOUNT: 3,
    NOT_SEND_TWITTER: 4,
    PENDING_USER: 5             // This is for tip user
}

const GetTicketTimes = 1
const GetRegisterTimes = 5
const GetTicketInterval = 1;
const GetRegisterInterval = 5;

// login
export const login = async (username, ethAddress, callback) => {
    return new Promise(async (resolve, reject) => {
        // store.commit('saveAccountInfo', {})
        let account = await gui(username, ethAddress)
        let getTicketTimes = 0;
        let getAccountTimes = 0;
        if (account && account.code === FetchingStatus.MATCH_ACCOUNT) {
            store.commit('saveAccountInfo', account.account)
            monitorNFTReceiveState(account.account)
            resolve(true)
            return;
        }
        while (true) {
            if (account) {
                if(account.code === FetchingStatus.MATCH_TICKETS) {
                    await sleep(GetTicketInterval)
                    account = await gui(username, ethAddress)
                    getTicketTimes++;
                } else if(account.code === FetchingStatus.REGISTERING) {
                    await sleep(GetRegisterInterval)
                    account = await gui(username, ethAddress)
                    getAccountTimes++;
                }

                if (account.code === FetchingStatus.NOT_REGISTED) {
                    resolve(false)
                    return;
                } else if(account.code === FetchingStatus.MATCH_ACCOUNT) {
                    store.commit('saveAccountInfo', account.account)
                    monitorNFTReceiveState(account.account)
                    resolve(true)
                    return;
                } else if (account.code === FetchingStatus.PENDING_USER) {
                    store.commit('saveAccountInfo', {...account.account, isPending: true})
                    resolve(true)
                    return;
                }
                if (getTicketTimes > GetTicketTimes) {
                    callback(FetchingStatus.NOT_SEND_TWITTER)
                    resolve(false)
                    return;
                }
                if (getAccountTimes > GetRegisterTimes) {
                    resolve(false)
                    return;
                } 
                callback(account.code)
                resolve(false)
            }else {
                reject(500)
                return;
            }
        }
    })
}

function getReceivedState(accountInfo) {
    getNftReceivedState(accountInfo.twitterId).then(res => {
        const { hasReceivedNft, reputation, hasMintedRP } = res;
        if (hasReceivedNft) {
            stopMonitorNFTReceiveState()
            store.commit('saveHasReceivedNft', true)
        }else{
            if (hasMintedRP) {
                stopMonitorNFTReceiveState()
                accountInfo.reputation = reputation;
                store.commit('saveAccountInfo', accountInfo)
                store.commit('saveHasReceivedNft', false)
            }
        }
    }).catch(err => {})
}

export const monitorNFTReceiveState = async (accountInfo) => {
    stopMonitorNFTReceiveState()
    if (accountInfo.hasReceivedNft) return
    getReceivedState(accountInfo)
    const monitorInserval = setInterval(() => {
        getReceivedState(accountInfo)
    }, 10000);
    store.commit('saveMonitorNftInserval', monitorInserval)
}

export const stopMonitorNFTReceiveState = async () => {
    try{
        clearInterval(store.state.monitorNftInserval)
    }catch(e){}
}

export const getUserInfo = async (username) => {
    return new Promise(async (resolve, reject) => {
        let account = await gui(username)
        if (account && account.code === FetchingStatus.MATCH_ACCOUNT) {
            resolve(account.account)
        }else {
            reject(500)
        }
    })
}

export const logout = async (twitterId) => {
    return new Promise(async (resolve, reject) => {
        try{
            lo(twitterId);

            store.commit('saveAccountInfo', {})
            store.commit('savePosts', [])
            store.commit('saveTransactions', [])
            store.commit('saveTips', [])
            store.commit('saveERC20Balances', {})
            store.commit('saveStellarTreks', {})
            resolve()
        } catch (e) {
            console.log('Log out fail:', e);
            resolve(false);
        }
    })
}

export const getUsersTips = async (params) => {
    await checkAccessToken();
    const tips = await gut(params)
    return tips;
}

export const refreshToken = async () => {
    const acc = store.getters.getAccountInfo;
    if (acc && acc.twitterId) {
        const token = await twitterRefreshAccessToken(acc.twitterId);
        store.commit('saveAccountInfo', {...acc, ...token})
    } else {
        throw 'log out'
    }
  }

export const isTokenExpired = async () => {
    const acc = store.getters.getAccountInfo;
    if (acc && acc.expiresAt) {
        const timestamp = new Date().getTime();
        if (acc.expiresAt - timestamp < 10000) {
            return false;
        }else {
            return true;
        }
    }
    return false
}

export async function checkAccessToken() {
    let acc = store.getters.getAccountInfo;
    if (acc && acc.accessToken) {
        const { expiresAt } = acc;
        if (expiresAt - new Date().getTime() < 600000) {
            // refresh token 
            try {
                await refreshToken();
                acc = store.getters.getAccountInfo;
            }catch(e) {
                throw 'log out';
            }
        }
        return acc.accessToken
    }else {
        // need auth again
        await logout();
        throw 'log out';
    }
}