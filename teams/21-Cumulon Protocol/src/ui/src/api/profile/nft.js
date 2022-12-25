import request from "@/utils/request";
import utils from "@/utils/index";


// 获取所有链
export function getAccountOwnedNFT(data) {
    return request({
        url: `${window.BASE_API}/sublink/nft/rmrk/getAccountOwnedNFT`,
        method: 'post',
        data
    })
}