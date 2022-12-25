import request from "@/utils/request";
import utils from "@/utils/index";

function formatUrl4Rmrk(url) {
    return utils.formatUrl(window.RMRK_API || '/rmrk', url);
}
// 详情
export function getCollectionStatistic(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getCollectionStatistic'),
        method: 'post',
        data
    })
}
export function getTradeDetailOfCollections(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getTradeDetailOfCollections'),
        method: 'post',
        data
    })
}
export function getAvgPriceVolumeOfCollection(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getAvgPriceVolumeOfCollection'),
        method: 'post',
        data
    })
}
export function getPriceRangeOfCollection(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getPriceRangeOfCollection'),
        method: 'post',
        data
    })
}
export function getTransactionsOfCollection(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getTransactionsOfCollection'),
        method: 'post',
        data
    })
}
export function getTransactionCountOfCollection(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getTransactionCountOfCollection'),
        method: 'post',
        data
    })
}
export function getCollections(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getCollections'),
        method: 'post',
        data
    })
}
export function getTradeHistoryOfNFT(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getTradeHistoryOfNFT'),
        method: 'post',
        data
    })
}
export function getNFTs(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getNFTs'),
        method: 'post',
        data
    })
}
export function getNFT(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getNFT'),
        method: 'post',
        data
    })
}
export function updateCollectionEntityName(data) {
    return request({
        url: formatUrl4Rmrk("/rmrk-analysis/updateCollectionEntityName"),
        method: "post",
        data
    });
}
export function getAllNFTs(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getAllNFTs'),
        method: 'post',
        data
    })
}
export default {
    getCollections,
    getNFTs,
    getAllNFTs
}