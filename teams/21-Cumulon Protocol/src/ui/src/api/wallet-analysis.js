import request from "@/utils/request";

function getChainList(data) {
  return request({
    url: "/wallet-analysis/getChainList",
    method: "post",
    data
  });
}
function getAddressTagList(data) {
  return request({
    url: "/wallet-analysis/getAddressTagList",
    method: "post",
    data
  });
}

getAddressTagList;
function getWalletAddressList(data) {
  return request({
    url: "/wallet-analysis/getWalletAddressList",
    method: "post",
    data
  });
}
function getWalletAddressSimpleInfo(data) {
  return request({
    url: "/wallet-analysis/getWalletAddressSimpleInfo",
    method: "post",
    data
  });
}
function getWalletAddressTransactionInfo(data) {
  return request({
    url: "/wallet-analysis/getWalletAddressTransactionInfo",
    method: "post",
    data
  });
}
function getLabelDefs(data) {
  return request({
    url: "/wallet-analysis/getLabelDefs",
    method: "post",
    data
  });
}
// export function getInfo(token) {
//   return request({
//     url: '/vue-element-admin/user/info',
//     method: 'get',
//     params: { token }
//   })
// }
export default {
  getChainList,
  getAddressTagList,
  getWalletAddressList,
  getWalletAddressSimpleInfo,
  getWalletAddressTransactionInfo,
  getLabelDefs
};
