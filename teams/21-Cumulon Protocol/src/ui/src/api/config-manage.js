import request from "@/utils/request";

function getChainList(data) {
  return request({
    url: "/wallet-analysis/getChainList",
    method: "post",
    data
  });
}
function getWalletLabelConfig(data) {
  return request({
    url: "/config-manage/getWalletLabelConfig",
    method: "post",
    data
  });
}
function updateWalletLabelConfig(data) {
  return request({
    url: "/config-manage/updateWalletLabelConfig",
    method: "post",
    data
  });
}
function getAddressTagList(data) {
  return request({
    url: "/config-manage/getAddressTagList",
    method: "post",
    data
  });
} function updateAddressTag(data) {
  return request({
    url: "/config-manage/updateAddressTag",
    method: "post",
    data
  });
} function removeAddressTag(data) {
  return request({
    url: "/config-manage/removeAddressTag",
    method: "post",
    data
  });
}
export default {
  getWalletLabelConfig,
  updateWalletLabelConfig,
  getAddressTagList,
  updateAddressTag,
  removeAddressTag
};
