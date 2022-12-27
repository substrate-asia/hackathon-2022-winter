import axios from "axios"
import steem from "steem"
const { auth } = require("steem");
import { sha256 } from 'js-sha256'
import { hexTou8array, stringToHex } from '@/utils/helper'
import base58 from 'bs58'
import { BACKEND_API_URL } from '@/config'

steem.api.setOptions({ url: 'https://api.steemit.com' })
// use vue proxy to hide CORS issue
const steem_api = 'https://steem.wh3.io'

export const getAccountInfo = async (account) => {
    return new Promise((resolve, reject) => {
        steem.api.getAccounts([account], (err, result) => {
            if (err) {
                console.log('Get steem account data fail:', err)
                resolve()
            }else {
                resolve(result[0])
            }
        })
    })
}

export async function getGlobalProperties() {
    return new Promise(async (resolve, reject) => {
        axios.post(steem_api, '{"jsonrpc":"2.0", "method":"database_api.get_dynamic_global_properties", "id":1}').then(res => {
            if (res.data.result)
                resolve(res.data.result)
            else
                reject();
        }).catch(err => {
            console.log('Get steem global data fail:', err)
            reject(err)
        })
    })
}

export async function vestsToSteem(vests) {
    const props = await getGlobalProperties()
    const totalSteem = Number(props.total_vesting_fund_steem.amount) / (10 ** props.total_vesting_fund_steem.precision)
    const totalVests = Number(props.total_vesting_shares.amount) / (10 ** props.total_vesting_shares.precision)
    return ((parseFloat(vests) * totalSteem) / totalVests)
}

export const getAccountRC = async (account) => {
    return new Promise((resolve, reject) => {
        axios.post(steem_api, '{"jsonrpc":"2.0", "method":"rc_api.find_rc_accounts", "params":{"accounts":["' + account + '"]}, "id":1}')
        .then(res => {
            if (res.data.result) {
                const rc = res.data.result.rc_accounts[0]
                var elapsed = Date.now() / 1000 - rc.rc_manabar.last_update_time;
                var maxMana = parseFloat(rc.max_rc);
                // 432000 sec = 5 days
                var currentMana = parseFloat(rc.rc_manabar.current_mana) + elapsed * maxMana / 432000;
                if (currentMana > maxMana) {
                    currentMana = maxMana
                }
                resolve([currentMana, maxMana])
            } else
                reject()
        }).catch(err => {
            console.log('Get steem account data fail:', err)
            reject(err)
        })

    })
}

/**
 * Get voting powering status
 * @param {*} account 
 * @returns 
 */
export function getVPHF20(account) {
    var totalShares = parseFloat(account.vesting_shares) + parseFloat(account.received_vesting_shares) - parseFloat(account.delegated_vesting_shares) - parseFloat(account.vesting_withdraw_rate);

    var elapsed = Date.now() / 1000 - account.voting_manabar.last_update_time;
    var maxMana = totalShares * 1000000;
    // 432000 sec = 5 days
    var currentMana = parseFloat(account.voting_manabar.current_mana) + elapsed * maxMana / 432000;

    if (currentMana > maxMana) {
        currentMana = maxMana;
    }

    return [currentMana, maxMana]

    var currentManaPerc = currentMana * 100 / maxMana;

    return Math.round(currentManaPerc * 100);
}

export const getPost = async (author, permlink) => {
    return new Promise(async (resolve, reject) => {
        try{
            const res = await steem.api.getContentAsync(author, permlink);
            if (res && res.author !== "" && res.permlink !== "") {
                resolve(res);
            } else {
                resolve(0)
            }
        }catch(e) {
            resolve(0)
        }
    })
}

export const getPosts = async (posts) => {
    return new Promise(async (resolve, reject) => {
        const steemPosts = await Promise.all(posts.map(post => getPost(post.steemId, post.postId)))
        posts = posts.map((p, idx) => {
            const steemP = steemPosts[idx]
            if (steemP === 0) return {
                ...p,
                curatorPayoutValue: "0 SBD",
                pendingPayoutValue: "0 SBD",
                totalPayoutValue: "0 SBD",
                votes: 0
            }
            return {
                ...p,
                children: steemP.children,
                curatorPayoutValue: steemP.curator_payout_value,
                pendingPayoutValue: steemP.pending_payout_value,
                totalPayoutValue: steemP.total_payout_value,
                votes: steemP.active_votes.length
            }
        })
        resolve(posts)
    })
}

export const getComments = async (author, permlink) => {
    return new Promise(async (resolve, reject) => {
        const res = await steem.api.getContentRepliesAsync(author, permlink);
        if (res && res.author !== "" && res.permlink !== "") {
            resolve(res);
        } else {
            reject(0)
        }
    })
}

export const getSteemBalance = async (username) => {
    const accountInfo = await getAccountInfo(username)
    const sbdBalance = parseFloat(accountInfo ? accountInfo.sbd_balance : 0)
    const steemBalance = parseFloat(accountInfo ? accountInfo.balance : 0)
    return {steemBalance, sbdBalance}
}

// use eth private key to generate a steem brain key
export const generateBrainKey = (key) => {
    key = '0x80' + key;
    var checksum = sha256(key)
    checksum = sha256(checksum)
    checksum = checksum.slice(0, 4)
    const private_wif = key + checksum;
    return 'P' + base58.encode(hexTou8array(private_wif))
}

const generateAuth = (user, pass, type) => {
    const key = auth.getPrivateKeys(user, pass, [type]);
  
    const publicKey = auth.wifToPublic(Object.values(key)[0]);
    if (type == "memo") {
      return {
        key: key,
        auth: publicKey
      };
    } else {
      return {
        key: key,
        auth: publicKey
      };
    }
  };

const generateKeys = (username, pass) => {
    const owner = generateAuth(username, pass, "owner");
    const active = generateAuth(username, pass, "active");
    const posting = generateAuth(username, pass, "posting");
    const memo = generateAuth(username, pass, "memo");

    return {
        key: {
            owner: owner.key,
            active: active.key,
            posting: posting.key,
            memo: memo.key
        },
        auth: {
            owner: owner.auth,
            active: active.auth,
            posting: posting.auth,
            memo: memo.auth
        }
    };
};

// use eth private key to generate steem auth
export const generateSteemAuth = (ethPK) => {
    const pass = generateBrainKey(ethPK)
    const account = generateKeys('wormhole', pass);
    const keys = {
        postingPub: account.auth.posting,
        postingPri: account.key.posting.posting,
        owner: account.auth.owner,
        active: account.auth.active,
        memo: account.auth.memo
    }
    return stringToHex(JSON.stringify(keys))
}

export const fetchSteemAuth = async (ethPK, steemAccount) => {
    const pass = generateBrainKey(ethPK)
    const account = generateKeys('wormhole', pass);
    if (await verifyAuth(steemAccount, account.key.posting.posting)) {
        return account.key;
    }
    return null
}

export const verifyAuth = async (name, key, role='posting') => {
    const account = await getAccountInfo(name);
    const pubkey = account[role];
    const threshold = pubkey.weight_threshold;
    let originalPub = [];
    for (let k of pubkey.key_auths) {
        if (k[1] >= threshold) {
            originalPub.push(k[0]);
        }
    }
    const pub = auth.wifToPublic(key);
    return originalPub.indexOf(pub) !== -1;
}

export const updateAccount = async (name, ownerKey, newPassword, role='active') => {
    const account = await getAccountInfo(name);
    console.log('Account:', account);
    const keys = generateKeys(name, newPassword);
    console.log('Keys:', keys.auth, keys.key);

    const who_owner = {'weight_threshold': 1, 'account_auths': [], 'key_auths': [[keys.auth.owner, 1]]}
    const who_active = {'weight_threshold': 1, 'account_auths': [], 'key_auths': [[keys.auth.active, 1]]}
    const who_posting = {'weight_threshold': 1, 'account_auths': [], 'key_auths': [[keys.auth.posting, 1]]}
    try{
        console.log('start');
        const res = await steem.broadcast.accountUpdate(ownerKey, name, who_owner, who_active, who_posting, keys.auth.memo, account.json_metadata)
        console.log(('ok'));
        return res;
    }catch(e) {
        console.log('Update account fail:', e);
    }
}