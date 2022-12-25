import request from "@/utils/request";
import utils from "@/utils/index";

function formatUrl4Rmrk(url) {
    return utils.formatUrl(window.RMRK_API || '/rmrk', url);
}
function getNFTResourceStatistic(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getNFTResourceStatistic'),
        method: 'post',
        data
    })
}
function getNFTResourceList(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getNFTResourceList'),
        method: 'post',
        data
    })
}
function getNFTResourceTree(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getNFTResourceTree'),
        method: 'post',
        data
    })
}
function getNFTChildrenList(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getNFTChildrenList'),
        method: 'post',
        data
    })
}
function getNFTChildrenTree(data) {
    return request({
        url: formatUrl4Rmrk('/rmrk-analysis/getNFTChildrenTree'),
        method: 'post',
        data
    })
}

export default {
    getNFTResourceStatistic,
    getNFTResourceTree,
    getNFTResourceList,
    getNFTChildrenList,
    getNFTChildrenTree
}
