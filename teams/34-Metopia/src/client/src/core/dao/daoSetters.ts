import { web3FromAddress } from '@polkadot/extension-dapp'
import { stringToHex } from '@polkadot/util'
import { Signer } from 'ethers'
import { localRouter, snapshotApi } from '../../config/urls'
import { basicFormToPersistent } from './settingsFormatParser'
import { BasicFormData, DaoSettings } from './type'

export const defaultForm = () => {
    return {
        basicFormData: {
            name: '',
            introduction: '',
            website: '',
            discord: '',
            twitter: '',
            opensea: '',
            avatar: '',
            banner: '',
        },
        consensusForm: { membership: [] },
        votingForm: {
            delay: 0,
            period: 3600,
            quorum: 0
        },
        proposalForm: {
            validation: {
                name: "basic",
                params: {}
            },
            filters: { onlyMembers: false, minScore: 0 }
        },
        network: null
    }
}

export const doCreateDao = (settings, signer: Signer) => {
    return new Promise((acc, rej) => {
        signer.signMessage(JSON.stringify(settings)).then(signature => {
            return fetch(snapshotApi.dao_create, {
                body: JSON.stringify({ id: settings.name, settings: JSON.stringify(settings), signature: signature }),
                method: 'post',
            })
        }).then(r => r.json()).then((r) => {
            if (r.code === 200) {
                fetch(snapshotApi.loadSpaces).then(r2 => {
                    return r2.json()
                }).then(r3 => {
                    window.location.href = localRouter('dao.prefix') + r.content
                }).finally(() => acc(200))
            } else {
                rej()
            }
        }).catch(rej)
    })
}

export const doCreateDaoV2 = (settings: BasicFormData, wallet): Promise<any> => {
    return new Promise((accept, reject) => {

        web3FromAddress(wallet.address).then(provider => {
            const signRaw = provider?.signer?.signRaw;
            return signRaw({
                address: wallet.address,
                data: stringToHex(JSON.stringify(settings)),
                type: 'bytes'
            }).then(({ signature }) => {
                fetch(snapshotApi.dao_create, {
                    body: JSON.stringify({ id: settings.name, settings: JSON.stringify(settings), signature: signature }),
                    method: 'post',
                }).then(r => r.json()).then((r) => {
                    if (r.code === 200) {
                        fetch(snapshotApi.loadSpaces).then(res => {
                            accept(r)
                        }).catch(e => {
                            reject('server cracked')
                        })
                    } else {
                        reject('server rejected')
                    }
                }).catch(() => {
                    reject('signature failed')
                })
            })
        })

    })
}

export const doUpdateDao = (id, settings, wallet): Promise<{ code: number, content: any }> => {
    settings.strategies?.forEach(s => s.name = "balanceof-sub-nft")
    return new Promise((acc, rej) => {
        web3FromAddress(wallet.address).then(provider => {
            const signRaw = provider?.signer?.signRaw;  
            return signRaw({
                address: wallet.address,
                data: stringToHex(JSON.stringify(settings)),
                type: 'bytes'
            }).then(({ signature }) => {
                fetch(snapshotApi.dao_update, {
                    method: 'post',
                    body: JSON.stringify({ id: id, settings: JSON.stringify(settings), signature: signature })
                }).then(r => r.json()).then((r) => {
                    if (r.code === 200) {
                        return fetch(snapshotApi.loadSpaces).then(r2 => {
                            return acc(r)
                        })
                    } else {
                        rej()
                    }
                }).catch(rej)
            })
        })
    })
}

export const getContractFromSettings = (settings: DaoSettings): string[] => {
    let result = settings?.strategies?.length ? settings.strategies.filter(s => s.params?.collectionId != null).map(s => {
        return s.params.collectionId
    }) : []
    return result
}

export * from './settingsFormatParser'

