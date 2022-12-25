import request from "@/utils/request";
import utils from "@/utils/index";


// 获取所有链
export function getAllSupportedChains(data) {
    return request({
        url: `${window.BASE_API}/sublink/parachain/getAllSupportedChains`,
        method: 'post',
        data
    })
}
// 根据network数组获取所有地址
export function ss58transform(data) {
    return request({
        url: `${window.BASE_API}/sublink/parachain/ss58transform`,
        method: 'post',
        data
    })
}
export function getBalance(data) {
    return request({
        url: `${window.BASE_API}/sublink/parachain/getBalance`,
        method: 'post',
        data
    })
}
export function getPrice(data) {
    return request({
        url: `${window.BASE_API}/oracle/getPrice`,
        method: 'post',
        data
    })
}
export function getAccountDetail(data) {
    return request({
        url: `${window.BASE_API}/polkadot-balance/polkadot-balance-analysis/getAccountDetail`,
        method: 'post',
        data
    })
}