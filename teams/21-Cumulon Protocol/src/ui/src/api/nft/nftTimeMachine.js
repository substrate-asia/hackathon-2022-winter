import request from "@/utils/request";
import utils from "@/utils/index";

function formatUrl4Rmrk(url) {
  return utils.formatUrl(window.RMRK_API || "/rmrk", url);
}
 
export function getOwnershipOfNFTAtDate(data) {
  return request({
    url: formatUrl4Rmrk('/rmrk-analysis/getOwnershipOfNFTAtDate'),
    method: 'post',
    data
  })
}
export function getOwnershipHistoryOfNFT(data) {
  return request({
    url: formatUrl4Rmrk('/rmrk-analysis/getOwnershipHistoryOfNFT'),
    method: 'post',
    data
  })
}

export function getAccountOwnedNFT(data) {
  return request({
    url: formatUrl4Rmrk('/rmrk-analysis/getAccountOwnedNFT'),
    method: 'post',
    data
  })
}
export function getAccountOwnedNFTAtDate(data) {
  return request({
    url: formatUrl4Rmrk('/rmrk-analysis/getAccountOwnedNFTAtDate'),
    method: 'post',
    data
  })
}

export default { 
  getAccountOwnedNFT,
  getAccountOwnedNFTAtDate,
  getOwnershipHistoryOfNFT,
  getOwnershipOfNFTAtDate
}