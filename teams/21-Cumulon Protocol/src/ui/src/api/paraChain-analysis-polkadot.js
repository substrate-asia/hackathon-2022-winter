import request from "@/utils/request";
import utils from "@/utils/index";
function formatUrl4Polkadot(url) {
    return utils.formatUrl(window.POLKADOT_API || '/polkadot', url);
}


function getPolkParaChainList(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getPolkParaChainList"),
        method: "post",
        data
    });
}

function getPolkParaChainCrowdloanList(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getPolkParaChainCrowdloanList"),
        method: "post",
        data
    });
}

function getPolkParaChainCrowdloanContributionList(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getPolkParaChainCrowdloanContributionList"),
        method: "post",
        data
    });
}

function getTopContributorOfMultiRound(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getTopContributorOfMultiRound"),
        method: "post",
        data
    });
}

function getContributorCompareOfMultiRound(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getContributorCompareOfMultiRound"),
        method: "post",
        data
    });
}

function getRaisedCompareOfMultiRound(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getRaisedCompareOfMultiRound"),
        method: "post",
        data
    });
}

function getContributorsRankingList(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getContributorsRankingList"),
        method: "post",
        data
    });
}

function getTotalNumberOfContributions(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getTotalNumberOfContributions"),
        method: "post",
        data
    });
}

function getTotalContributionAmount(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getTotalContributionAmount"),
        method: "post",
        data
    });
}

function getOverallContributionAmountAndAcountDailyIncrease(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getOverallContributionAmountAndAcountDailyIncrease"),
        method: "post",
        data
    });
}

function getCrowdloanCapAndRaisedValue(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getCrowdloanCapAndRaisedValue"),
        method: "post",
        data
    });
}

function getPieChartContributorsRankingList(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getPieChartContributorsRankingList"),
        method: "post",
        data
    });
}

function getPolkParaChainRoundList(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/getPolkParaChainRoundList"),
        method: "post",
        data
    });
}
function updatePolkParaChain(data) {
    return request({
        url: formatUrl4Polkadot("/parachain-analysis/updatePolkParaChain"),
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