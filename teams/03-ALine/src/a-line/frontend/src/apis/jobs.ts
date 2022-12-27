import httpRequest from "@/request/index";

interface GetJobLogsParams {
  id: number | string;
  name: string;
}

interface GetJobStagelogsParams {
  id: string | number;
  name: string;
  stagename: string;
  start: number;
}

// 查看所有日志
export function apiGetAllJobLogs(params: GetJobLogsParams) {
  return httpRequest({
    url: `/pipeline/${params.name}/logs/${params.id}`,
    method: "get",
  });
}

//  获取指定stage日志
export function apiGetJobStageLogs(params: GetJobStagelogsParams) {
  return httpRequest({
    url: `/pipeline/${params.name}/logs/${params.id}/${params.stagename}`,
    method: "get",
    params: {start: params.start},
  });
}

// /pipeline/:name/detail/:id/artifactory
export function apiCheekArtifactorys(params: GetJobLogsParams) {
  return httpRequest({
    url: `/pipeline/${params.name}/detail/${params.id}/artifactory`,
    method: "get",
  });
}
