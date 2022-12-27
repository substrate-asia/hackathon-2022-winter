import { web3FromAddress } from "@polkadot/extension-dapp"
import { stringToHex } from "@polkadot/util"
import { Signer } from "ethers"
import useSWR from "swr"
import { userApi } from "../config/urls"
import { defaultSWRConfig, encodeQueryData, getFetcher } from "../utils/restUtils"
import { Account } from "./dao/type"
export const createAccount = (owner, referral, wallet) => {
    return new Promise((accept, reject) => {
        let msg = {
            owner, username: '', avatar: '', introduction: '', referral, timestamp: parseInt(new Date().getTime() / 1000 + ''),
            ownerType: 'polkadot'
        }
        web3FromAddress(wallet.address).then(provider => {
            const signRaw = provider?.signer?.signRaw;
            return signRaw({
                address: wallet.address,
                data: stringToHex(JSON.stringify(msg)),
                type: 'bytes'
            }).then(({ signature }) => {
                fetch(userApi.user_create, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'signature': signature,

                    },
                    body: encodeQueryData(null, {
                        owner,
                        username: '',
                        avatar: '',
                        introduction: '',
                        referral,
                        msg: JSON.stringify(msg),
                        ownerType: 'polkadot'
                    })
                }).then(d => {
                    return d.json()
                }).then(d => {
                    if (d.code === 0) {
                        accept(d)
                    } else {
                        reject(d.msg)
                    }
                }).catch(e => {
                    reject(e)
                })
            })
        })
    })
}

export const updateAccount = (owner, username, avatar, introduction, wallet) => {
    return new Promise((accept, reject) => {
        if (!username) {
            username = ""
        } if (!avatar) {
            avatar = ""
        } if (!introduction) {
            introduction = ""
        }
        let msg = { owner, username, avatar, introduction, timestamp: parseInt(new Date().getTime() / 1000 + ''), ownerType: 'polkadot' }

        web3FromAddress(wallet.address).then(provider => {
            const signRaw = provider?.signer?.signRaw;
            return signRaw({
                address: wallet.address,
                data: stringToHex(JSON.stringify(msg)),
                type: 'bytes'
            }).then(({ signature }) => {
                return fetch(userApi.user_update + owner, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'signature': signature,
                    },
                    body: encodeQueryData(null, {
                        username,
                        avatar,
                        introduction,
                        msg: JSON.stringify(msg)
                    })
                    // })
                }).then(d => {
                    return d.json()
                }).then(d => {
                    if (d.code === 0) {
                        accept(d)
                    } else {
                        reject(d.msg)
                    }
                }).catch(e => {
                    console.error(e)
                    reject("Internal error")
                })
            })
        })
    })
}

export const selectByOwner = (owner) => {
    return fetch(userApi.user_selectByOwner + owner).then(d => d.json())
}

export const selectByOwners = (owners) => {
    if (!owners?.length)
        return {}
    let tmp = owners.map(o => 'owners=' + o)

    return fetch(userApi.user_selectByOwners + "?" + tmp.join('&')).then(d => d.json())
}

export const useAccountData = (owner, nonce?): { data: Account, code: number, msg: string, error: any } => {
    const { data, error } = useSWR(owner ? [userApi.user_update + owner, { nonce: nonce !== null ? nonce : 1 }] : null, getFetcher, defaultSWRConfig)
    return { data: data?.data, code: data?.code, msg: data?.msg, error: error || (data?.code !== 0 && data?.msg) }
}

export const useAccountListData = (owners) => {
    const { data, error } = useSWR(owners?.length ?
        [userApi.user_selectByOwners + "?" + [...owners, ''].map(o => 'owners=' + o).join('&')] :
        null, getFetcher, defaultSWRConfig)
    return { data: data?.data, error: error || (data?.code === 0 ? data?.msg : null) }
}

export const useUserGovernenceData = (owner, limit, offset) => {
    const { data, error } = useSWR([userApi.user_history, { address: owner, limit, offset }], getFetcher, defaultSWRConfig)
    return {
        data: data?.code === 200 ? data?.content : null,
        error: error || (data?.code !== 200 && data?.content)
    }
}

export const useUserHistoryDistinctSpaceData = (owner) => {
    const { data, error } = useSWR(owner ? [userApi.user_historyDistinctSpace, { address: owner }] : null,
        getFetcher, defaultSWRConfig)
    return {
        data: data?.code === 200 ? data?.content : null,
        error: error || (data?.code !== 200 && data?.content)
    }
}

export const useActiveList = owner => {
    const { data, error } = useSWR(owner ? [encodeQueryData(userApi.user_activeList, { owner })] : null,
        getFetcher, defaultSWRConfig)
    return { data: data?.data, error: error || (data?.code === 0 ? data?.msg : null) }
}