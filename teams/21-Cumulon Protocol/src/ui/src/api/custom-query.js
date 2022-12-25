import request from "@/utils/request";

function getList(data) {
  return request({
    url: "/custom-query/getList",
    method: "post",
    data
  });
}
function getDetail(data) {
  return request({
    url: "/custom-query/getDetail",
    method: "post",
    data
  });
}
function create(data) {
  return request({
    url: "/custom-query/create",
    method: "post",
    data
  });
}
function remove(data) {
  return request({
    url: "/custom-query/remove",
    method: "post",
    data
  });
}
function update(data) {
  return request({
    url: "/custom-query/update",
    method: "post",
    data
  });
}

function executeQuery(data) {
  return request({
    url: "/custom-query/executeQuery",
    method: "post",
    data
  });
}
function getTables(data) {
  return request({
    url: "/custom-query/getTables",
    method: "post",
    data
  });
}
export default {
  getList,
  getDetail,
  create,
  update,
  remove,
  executeQuery,
  getTables
};
