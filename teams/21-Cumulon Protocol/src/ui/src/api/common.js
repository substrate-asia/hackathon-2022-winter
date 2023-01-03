import request from "@/utils/request";

export function imgUpload(data) {
    return request({
        url: "https://web3go.xyz/portal/imgUpload",
        method: "post",
        data,
    });
}

// 搜索接口之前的转换
export function ss58transform(data) {
    return request({
        url: "/ss58transform",
        method: "post",
        data
    });
}