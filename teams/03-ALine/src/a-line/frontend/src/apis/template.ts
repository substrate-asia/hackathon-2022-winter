// 导入axios实例
import httpRequest from "@/request/index";

// 获取模板列表
export function apiGetTemplates(language: string) {
  return httpRequest({
    url: "/pipeline/templates",
    method: "get",
    headers: {
      lang: `${language}`,
    },
  });
}

export function apiGetTemplatesById(id: String) {
  return httpRequest({
    url: `/pipeline/template/${id}`,
    method: "get",
  });
}

// 添加
export function apiAddPipeline(name: String, yaml: String) {
  return httpRequest({
    url: "/pipeline",
    method: "post",
    data: {
      name: name,
      yaml: yaml,
    },
  });
}

//获取修改信息
export function apiGetPipelineByName(name: String) {
  return httpRequest({
    url: `/pipeline/${name}`,
    method: "get",
  });
}

//修改
export function apiEditPipeline(
  oldName: String,
  newName: String,
  yaml: String
) {
  return httpRequest({
    url: `/pipeline/${oldName}`,
    method: "put",
    data: {
      newName: newName,
      yaml: yaml,
    },
  });
}
