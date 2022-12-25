
import request from "@/utils/request";


function reportDataBoardViewCount(data) {
    return request({
        url: "/platform/reportDataBoardViewCount",
        method: "post",
        data
    });
}
function queryDataBoardViewCount(data) {
    return request({
        url: "/platform/queryDataBoardViewCount",
        method: "post",
        data
    });
};

function checkMaintenancePrivilege(data) {
    return request({
        url: "/platform/checkMaintenancePrivilege",
        method: "post",
        data
    });

};
export default {
    reportDataBoardViewCount,
    queryDataBoardViewCount,
    checkMaintenancePrivilege
};
