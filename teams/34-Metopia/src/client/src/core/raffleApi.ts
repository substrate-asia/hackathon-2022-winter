import { Signer } from "ethers"
import useSWR from "swr"
import { Raffle, RaffleFilter, RaffleReward } from "../config/type/RaffleType"
import { raffleApi } from "../config/urls"
import { defaultSWRConfig, encodeQueryData, getFetcher } from "../utils/restUtils"

export declare type RaffleApiType = {
    owner: string,
    daoId: string,
    title: string,
    body?: string,
    cover?: string,

    start?: string,
    end?: string,
    filters: RaffleFilter[],
    reward: RaffleReward[]
    form?,
    ipfsHash?,
    signature?
}

/**
 * TODO => Promise
 */

export const createRaffle = (data: Raffle, owner: string, signer: Signer): Promise<any> => {
    let msg = JSON.stringify(Object.assign({}, data, { owner: owner, timestamp: parseInt(new Date().getTime() / 1000 + '') }))
    return new Promise((acc, rej) => {
        signer.signMessage(msg).then(sig => {
            return fetch(raffleApi.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',

                    'signature': sig
                },
                body: encodeQueryData(null, Object.assign({}, data, { owner, msg }))
            }).then(d => d.json()).then(d => {
                if (d.code == 0) {
                    acc(d)
                } else {
                    rej(d)
                }
            }).catch(rej)
        }).catch(e => {
            rej(e)
        })
    })
}

export const useRaffleList = (spaceId, playerCount?: number, playerOwner?) => {
    const { data, error } = useSWR([raffleApi.select,
    { daoId: spaceId, playerCount, playerOwner }], getFetcher, defaultSWRConfig)
    return { data: data?.code == 0 ? data?.data : null, error: data?.code != 0 ? data?.msg : null }
}

export const useRaffleData = (id, limit, offset, owner?, nonce?) => {
    const { data, error } = useSWR(id ? [raffleApi.selectById(id), { owner, limit, offset }, nonce] : null, getFetcher, defaultSWRConfig)
    return { data: data?.code == 0 ? Object.assign({}, data?.data, { filters: data?.data?.filters?.length ? JSON.parse(data?.data?.filters) : [] }) : null, error: data?.code != 0 ? data?.msg : null }
}
export const useMyRaffleData = (id, owner?, nonce?) => {
    const { data, error } = useSWR(id && owner ? [raffleApi.selectById(id), { owner, limit: 1, offset: 0 }, nonce] : null, getFetcher, defaultSWRConfig)
    return { data: data?.code == 0 ? Object.assign({}, data?.data) : null, error: data?.code != 0 ? data?.msg : null }
}

export const useRaffleRewardedData = (id, nonce?) => {
    const { data, error } = useSWR(id ? [raffleApi.selectById(id), { limit: 100, isReward: true }, nonce] : null, getFetcher, defaultSWRConfig)
    return { data: data?.code == 0 ? data?.data : null, error: data?.code != 0 ? data?.msg : null }
}
export const useSbtData = (spaceId) => {
    const { data, error } = useSWR([raffleApi.selectSbts, { space: spaceId }], getFetcher, defaultSWRConfig)
    return { data: data?.code == 0 ? data?.data : null, error: data?.code != 0 ? data?.msg : null }
}

export const joinRaffle = (raffleId, owner, signer: Signer) => {
    return new Promise((acc, rej) => {
        let msg = JSON.stringify({ owner, scoreParam: '{}', timestamp: parseInt(new Date().getTime() / 1000 + '') })
        signer.signMessage(msg).then(sig => {
            fetch(raffleApi.join(raffleId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'msg': msg,
                    'signature': sig
                },
                body: encodeQueryData(null, {
                    owner,
                    scoreParam: '{}',
                    msg
                })
            }).then(d => d.json()).then(d => {
                if (d.code === 0) {
                    acc(d)
                } else {
                    rej(d)
                }
            })
        }).catch(e => {
            rej(e)
        })
    })
}

export const drawRaffle = (raffleId, owner, signer: Signer) => {
    return new Promise((acc, rej) => {
        let msg = JSON.stringify({ owner, timestamp: parseInt(new Date().getTime() / 1000 + '') })
        signer.signMessage(msg).then(sig => {
            fetch(raffleApi.draw(raffleId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'msg': msg,
                    'signature': sig
                },
                body: encodeQueryData(null, {
                    owner,
                    msg
                })
            }).then(d => d.json()).then(d => {
                if (d.code === 0) {
                    acc(d)
                } else {
                    rej(d)
                }
            })
        }).catch(e => {
            rej(e)
        })
    })
}