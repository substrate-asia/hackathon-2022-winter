import request from "@/utils/request";
import utils from "@/utils/index";


export function getPolkadotCrowdloanContributions(data) {
    return request({
        url: `${window.BASE_API}/polkadot/parachain-analysis/getCrowdloanContributions`,
        method: 'post',
        data
    })
}

export function getKusamaCrowdloanContributions(data) {
    return request({
        url: `${window.BASE_API}/kusama/parachain-analysis/getCrowdloanContributions`,
        method: 'post',
        data
    })
}

export function getKusamaParaChainList(data) {
    return request({
        url: `${window.BASE_API}/kusama/parachain-analysis/getPolkParaChainList`,
        method: 'post',
        data
    })
}
export function getPolkadotParaChainList(data) {
    return request({
        url: `${window.BASE_API}/polkadot/parachain-analysis/getPolkParaChainList`,
        method: 'post',
        data
    })
} 