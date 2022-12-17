/* eslint-disable no-unused-vars */
const axios = require('axios').default;
const list_url = "/api/list";
const detail_url = "/api/byid?name="


export async function list(){
    console.log(list_url);
    return await axios.get(list_url);
}

export async function detail(projectname){
  console.log(detail_url + projectname);
  return await axios.get(detail_url + projectname);
}
