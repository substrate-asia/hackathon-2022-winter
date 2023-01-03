import request from "@/utils/request";

function getChainState(data) {
    return request({
        url: "/cdp-analysis/getChainState",
        method: "post",
        data
    });
}

function getChainStatistic(data) {
    return request({
        url: "/cdp-analysis/getChainStatistic",
        method: "post",
        data
    });
}

function getLoanPositionList(data) {
    return request({
        url: "/cdp-analysis/getLoanPositionList",
        method: "post",
        data
    });
}

function getLoanPositionStatistic(data) {
    return request({
        url: "/cdp-analysis/getLoanPositionStatistic",
        method: "post",
        data
    });
}

function getLoanActionList(data) {
    return request({
        url: "/cdp-analysis/getLoanActionList",
        method: "post",
        data
    });
}

function getLoanActionKline(data) {
    return request({
        url: "/cdp-analysis/getLoanActionKline",
        method: "post",
        data
    });
}
export default {
    getChainState,
    getChainStatistic,
    getLoanPositionList,
    getLoanPositionStatistic,
    getLoanActionList,
    getLoanActionKline
};