import request from "@/utils/request";
import utils from "@/utils/index";

function formatUrl4Moonriver(url) {
    return utils.formatUrl(window.MOONRIVER_API || '/moonriver', url);
}
//get reward statistic of delegator
export function getDelegatorRewardStatistic(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getDelegatorRewardStatistic'),
        method: 'post',
        data
    })
}
//get reward statistic of collator
export function getCollatorRewardStatistic(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getCollatorRewardStatistic'),
        method: 'post',
        data
    })
}
// 获取当前区块高度
export function getLatestBlockNumber(params) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getLatestBlockNumber'),
        method: 'get',
        params
    })
}
// get current round info;获取当前round的信息， 包含roundIndex, 起始区块高度， 区块长度
export function getCurrentRoundInfo(params) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getCurrentRoundInfo'),
        method: 'get',
        params
    })
}
// get max nominators count for each collator;获取每个Collator节点最多的nominator数量
export function getMaxNominatorsPerCollator(params) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getMaxNominatorsPerCollator'),
        method: 'get',
        params
    })
}
// get all collator candidates in realtime;获取实时的collator的候选列表，包含了所有的collator节点，可以根据这个列表数据来实时判断 collator节点的排位
export function getRealtimeCollatorCandidatePool(params) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getRealtimeCollatorCandidatePool'),
        method: 'get',
        params
    })
}
// get selected collators when the round start;获取在当前round开始运行前，已经选中的若干个collator节点列表
export function getSelectedCollators4CurrentRound(params) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getSelectedCollators4CurrentRound'),
        method: 'get',
        params
    })
}
// get all states include collators and nominators in realtime;获取实时的collator和nominator关联的列表，可以根据这个列表数据来实时判断 如果参加当前collator节点后， nominator的排位
export function getRealtimeCollatorState(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getRealtimeCollatorState'),
        method: 'post',
        data
    })
}
// get the scheduled exit of collators/nominators;获取这是计划要离开的collator节点和nominator，离开不是立刻生效的， 需要等待指定的roundIndex，可以根据该列表在预测下一个round的排位时， 注意检查如果roundIndex匹配， 需要排除掉对应的数据。
export function getScheduledExitQueue(params) {
    return request({
        url: formatUrl4Moonriver('​/moonriver-analysis​/getScheduledExitQueue'),
        method: 'get',
        params
    })
}
// get max collators count per round;获取每个round最多的collator数量
export function getMaxCollatorsPerRound(params) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getMaxCollatorsPerRound'),
        method: 'get',
        params
    })
}
//get nominator reward statistic of the specified round index;获取指定roundIndex的nominator reward统计信息，目前nominator的reward还无法按照collator分开
export function getNominatorReward(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getNominatorReward'),
        method: 'post',
        data
    })
}
// get collator reward statistic of the specified round index;获取指定roundIndex的collator reward统计信息
export function getCollatorReward(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getCollatorReward'),
        method: 'post',
        data
    })
}
// //get total reward statistic of the specified collators;获取collator所有的reward总和
export function getCollatorTotalReward(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getCollatorTotalReward'),
        method: 'post',
        data
    })
}
// 获取指定roundIndex的stake统计信息（collator stake, nominator stake）
export function atStake(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/atStake'),
        method: 'post',
        data
    })
}
// //获取collator的历史事件记录
export function getCollatorActionHistory(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getCollatorActionHistory'),
        method: 'post',
        data
    })
}
// 显示 当前Collator的所有的Reward History信息
export function getCollatorRewardHistory(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getCollatorRewardHistory'),
        method: 'post',
        data
    })
}
// 显示 当前Delegator的所有的Action History信息
export function getDelegatorActionHistory(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getDelegatorActionHistory'),
        method: 'post',
        data
    })
}
// 显示 当前Delagator的所有的Reward History信息
export function getDelegatorRewardHistory(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-analysis/getDelegatorRewardHistory'),
        method: 'post',
        data
    })
}
//获取订阅信息
export function getMySubscribe(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-monitor/getMySubscribe'),
        method: 'post',
        data
    })
}
//从订阅中移除某些地址
export function unsubscribe(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-monitor/unsubscribe'),
        method: 'post',
        data
    })
}
//订阅某些地址,订阅后当该Collator地址处于节点排序的边缘（位置在靠后10%时），会收到提示消息。
export function subscribe(data) {
    return request({
        url: formatUrl4Moonriver('/moonriver-monitor/subscribe'),
        method: 'post',
        data
    })
}

export default {
    getCollatorRewardStatistic,
    getDelegatorRewardStatistic,
    getLatestBlockNumber,
    getCurrentRoundInfo,
    getMaxNominatorsPerCollator,
    getRealtimeCollatorCandidatePool,
    getSelectedCollators4CurrentRound,
    getRealtimeCollatorState,
    getScheduledExitQueue,
    getMaxCollatorsPerRound,
    getCollatorReward,
    getCollatorTotalReward,
    getNominatorReward,
    atStake,
    getCollatorActionHistory,
    getCollatorRewardHistory,
    getDelegatorActionHistory,
    getDelegatorRewardHistory,
    getMySubscribe,
    unsubscribe,
    subscribe
};