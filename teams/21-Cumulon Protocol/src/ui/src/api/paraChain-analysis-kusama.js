import request from "@/utils/request";
import utils from "@/utils/index";
function formatUrl4Kusama(url) {
    return utils.formatUrl(window.KUSAMA_API || '/kusama', url);
}
function getPolkParaChainList(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getPolkParaChainList"),
        method: "post",
        data
    });
}

function getPolkParaChainCrowdloanList(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getPolkParaChainCrowdloanList"),
        method: "post",
        data
    });
}

function getPolkParaChainCrowdloanContributionList(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getPolkParaChainCrowdloanContributionList"),
        method: "post",
        data
    });
}

function getTopContributorOfMultiRound(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getTopContributorOfMultiRound"),
        method: "post",
        data
    });
}

function getContributorCompareOfMultiRound(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getContributorCompareOfMultiRound"),
        method: "post",
        data
    });
}

function getRaisedCompareOfMultiRound(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getRaisedCompareOfMultiRound"),
        method: "post",
        data
    });
}

function getContributorsRankingList(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getContributorsRankingList"),
        method: "post",
        data
    });
}

function getTotalNumberOfContributions(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getTotalNumberOfContributions"),
        method: "post",
        data
    });
}

function getTotalContributionAmount(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getTotalContributionAmount"),
        method: "post",
        data
    });
}

function getOverallContributionAmountAndAcountDailyIncrease(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getOverallContributionAmountAndAcountDailyIncrease"),
        method: "post",
        data
    });
}

function getCrowdloanCapAndRaisedValue(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getCrowdloanCapAndRaisedValue"),
        method: "post",
        data
    });
}

function getPieChartContributorsRankingList(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getPieChartContributorsRankingList"),
        method: "post",
        data
    });
}

function getPolkParaChainRoundList(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/getPolkParaChainRoundList"),
        method: "post",
        data
    });
}
function updatePolkParaChain(data) {
    return request({
        url: formatUrl4Kusama("/parachain-analysis/updatePolkParaChain"),
        method: "post",
        data
    });
}
export default {
    getPolkParaChainRoundList,
    getPieChartContributorsRankingList,
    getCrowdloanCapAndRaisedValue,
    getOverallContributionAmountAndAcountDailyIncrease,
    getTotalNumberOfContributions,
    getTotalContributionAmount,
    getContributorsRankingList,
    getTopContributorOfMultiRound,
    getContributorCompareOfMultiRound,
    getRaisedCompareOfMultiRound,
    getPolkParaChainList,
    getPolkParaChainCrowdloanList,
    getPolkParaChainCrowdloanContributionList,
    updatePolkParaChain
};