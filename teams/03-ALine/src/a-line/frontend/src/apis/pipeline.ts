// 导入axios实例
import httpRequest from "@/request/index";

interface GetPipelinesParams {
  query?: string;
  page?: number;
  size?: number;
}

interface GetPipelineInfoParams {
  page?: number;
  size?: number;
}

interface GetPipelineDetailParams {
  name?: string;
  id?: number | string;
}

export function apiGetPipelines(params: GetPipelinesParams) {
  return httpRequest({
    url: "/pipeline",
    method: "get",
    params: params,
  });
}

export function apiGetPipelineInfo(
  name: string,
  params: GetPipelineInfoParams
) {
  return httpRequest({
    url: `/pipeline/${name}/details`,
    method: "get",
    params: params,
  });
}

export function apiDeletePipelineInfo(name: string, id: number) {
  return httpRequest({
    url: `/pipeline/${name}/detail/${id}`,
    method: "delete",
  });
}

export function apiOperationStopPipeline(name: string) {
  return httpRequest({
    url: `/pipeline/exec/${name}`,
    method: "post",
    data: name,
  });
}

export function apiImmediatelyExec(name: string) {
  return httpRequest({
    url: `/pipeline/${name}/exec`,
    method: "post",
    data: name,
  });
}

export function apiStopPipeline(params: { name: string; id: number }) {
  return httpRequest({
    url: `/pipeline/${params.name}/${params.id}/stop`,
    method: "post",
    data: params,
  });
}

// /pipeline/:name/detail/:id
export function apiGetPipelineDetail(params: GetPipelineDetailParams) {
  return httpRequest({
    url: `/pipeline/${params.name}/detail/${params.id}`,
    // url:"https://console-mock.apipost.cn/mock/ae73cd30-20d8-4975-b034-48b34891e956/pipeline/:name/detail/:id?apipost_id=6bbbe6",
    method: "get",
    params: params,
  });
}

export function apiGetPipeline(name: String) {
  return httpRequest({
    url: `/pipeline/${name}`,
    method: "get",
  });
}

export function apiDeletePipelineList(name: string) {
  return httpRequest({
    url: `/pipeline/${name}`,
    method: "delete",
  });
}
