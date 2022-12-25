import request from "@/utils/request";

export function supports(data) {
    return request({
        url: '/parachain/staking/supports',
        method: 'get',
        params: data
    });
}
export function getCollatorRewardStatistic(data) {
    return request({
        url: '/parachain/staking/getCollatorRewardStatistic',
        method: 'post',
        data
    });
}
export function getRealtimeCollatorState(data) {
    return request({
        url: '/parachain/staking/getRealtimeCollatorState',
        method: 'post',
        data
    });
}
export function getCollatorRewardHistory(data) {
    return request({
        url: '/parachain/staking/getCollatorRewardHistory',
        method: 'post',
        data
    });
}
export function getCollatorActionHistory(data) {
    return request({
        url: '/parachain/staking/getCollatorActionHistory',
        method: 'post',
        data
    });
}
export function getDelegatorActionHistory(data) {
    return request({
        url: '/parachain/staking/getDelegatorActionHistory',
        method: 'post',
        data
    });
}
export function getDelegatorRewardHistory(data) {
    return request({
        url: '/parachain/staking/getDelegatorRewardHistory',
        method: 'post',
        data
    });
}
export function getDelegatorRewardStatistic(data) {
    return request({
        url: '/parachain/staking/getDelegatorRewardStatistic',
        method: 'post',
        data
    });
}
export function homeMyStake(data) {
    return request({
        url: '/parachain/staking/home/myStake',
        method: 'get',
        params: data
    });
}
export function networkStatistics(data) {
    return request({
        url: '/parachain/staking/home/network/statistics',
        method: 'get',
        params: data
    });
}
export function collatorStatistics(data) {
    return request({
        url: '/parachain/staking/collator/statistics',
        method: 'post',
        data
    });
}
export function getLatestBlockNumber(data) {
    return request({
        url: '/parachain/staking/getLatestBlockNumber',
        method: 'get',
        params: data
    });
}
export function getCurrentRoundInfo(data) {
    return request({
        url: '/parachain/staking/getCurrentRoundInfo',
        method: 'get',
        params: data
    });
}
export function getSafeStateConfig(data) {
    return request({
        url: '/parachain/staking/collator/getSafeStateConfig',
        method: 'get',
        params: data
    });
}



