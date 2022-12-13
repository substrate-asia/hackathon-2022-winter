import request from "../request/index";
import http from "../request/index";

//   let arr = [
//     "query {",
//     "    assignRewards (",
//     "       filter:{",
//     '       recipient :{equalToInsensitive:"' + $store.state.accs + '"}',
//     "      }",
//     "      first: 5) {",
//     "        nodes {",
//     "            id",
//     "            recipient",
//     "            amount",
//     "            contractAddress",
//     "        }",
//     "    }",
//     "}",
//   ];

function getList(val) {
  let arr = [
    "query {",
    'contents(filter:{flag:{equalTo:true} content:{equalToInsensitive:"' +
      val +
      '"} },first: 10,offset:0,orderBy:BLOCK_HASH_ASC){',
    "nodes{",
    "id,",
    "blockHash,",
    "content,",
    "categoryId",
    "category{",
    "name",
    "},",
    "label,",
    "dimensionId,",
    "dimension{",
    "name",
    "},",
    "lastAuthor,",
    "lastDate,",
    "flag",
    "}",
    "}",
    "}",
  ];
  return new Promise((resolve, reject) => {
    http("post", "", { query: arr.join() }).then(
      (res) => {
        resolve(res);
      },
      (error) => {
        console.log("网络异常~", error);
        reject(error);
      }
    );
  });
}
export { getList };
