import request from "@/utils/request";


// 获取所有链
export function queryDataBoardList(data) {
    return request({
        url: `/analytics-insight/queryDataBoardList`,
        method: 'post',
        data
    })
}