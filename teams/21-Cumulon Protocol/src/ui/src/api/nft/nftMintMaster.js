import request from "@/utils/request";
import utils from "@/utils/index";

function formatUrl4Rmrk(url) {
  return utils.formatUrl(window.RMRK_API || "/rmrk", url);
}
// 详情
export function getCollectionStatistic(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getCollectionStatistic"),
    method: "post",
    data
  });
}
export function getTradeDetailOfCollections(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getTradeDetailOfCollections"),
    method: "post",
    data
  });
}
export function getAvgPriceVolumeOfCollection(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getAvgPriceVolumeOfCollection"),
    method: "post",
    data
  });
}
export function getPriceRangeOfCollection(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getPriceRangeOfCollection"),
    method: "post",
    data
  });
}
export function getTransactionsOfCollection(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getTransactionsOfCollection"),
    method: "post",
    data
  });
}
export function getTransactionCountOfCollection(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getTransactionCountOfCollection"),
    method: "post",
    data
  });
}
export function getTopTradedCollections(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getTopTradedCollections"),
    method: "post",
    data
  });
}
export function getTotalCollectionVolumes(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getTotalCollectionVolumes"),
    method: "post",
    data
  });
}

export function getLatestMintStatistic(data) {
  return request({
    url: formatUrl4Rmrk("/rmrk-analysis/getLatestMintStatistic"),
    method: "post",
    data
  });
}
