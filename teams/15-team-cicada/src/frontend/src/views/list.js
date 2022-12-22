import React, { createRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import { getList } from "../request/governance";
import moment from "moment";
import { useParams, useLocation } from "react-router-dom";
import qs from "qs";
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
  Menu,
  Input,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import AccountSelector from "../AccountSelector";
import { SubstrateContextProvider, useSubstrateState } from "../substrate-lib";
import { DeveloperConsole } from "../substrate-lib/components";

import Floor from "../Floor";
import myContext from "../createContext";
function Main() {
  const Utf8ArrayToStr = (fileData) => {
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
    }
    console.log(dataString);
    return dataString;
  };
  const { apiState, apiError, keyringState } = useSubstrateState();
  const getPageQuery = () => parse(window.location.href.split("?")[1]);
  const [data, setData] = useState();
  const { search, state = {} } = useLocation();
  // 获取location.search中的参数
  const { val } = qs.parse(search.replace(/^\?/, ""));
  console.log(val);
  const getApiData = async () => {
    try {
      let res = await getList(val);
      res.data.contents.nodes.map((item, index) => {
        if (val) {
          let replaceReg = new RegExp(val, "ig");
          let replaceString = `<span style="color: orange">${val}</span>`;
          res.data.contents.nodes[index].content = item.content.replace(
            replaceReg,
            replaceString
          );
        }
      });
      Utf8ArrayToStr(res.data.contents.nodes[0].label);
      setData(res.data.contents.nodes);
    } catch (error) {
      console.log(error);
    }

    // request.getList
    //   .then((res) => {
    //     console.log(res.data.result);
    //     this.setState({
    //       list: res.data.result, //获取的数据保存到list数组
    //     });
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
  };
  useEffect(() => {
    getApiData([]);
  }, []);
  const loader = (text) => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  );

  const message = (errObj) => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  );
  // /解决要二次刷新才会有页面bug
  if (location.href.indexOf("#reloaded") == -1) {
    location.href = location.href + "#reloaded";
    location.reload();
  }
  if (apiState === "ERROR") return message(apiError);
  else if (apiState !== "READY") return loader("Connecting to Substrate");

  if (keyringState !== "READY") {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <myContext.Provider value={val}>
          <AccountSelector />
        </myContext.Provider>
        <div
          style={{
            justifyContent: "center",
            display: "flex",
            marginTop: "-30px",
            fontFamily: "Arial",
          }}
        >
          <div
            style={{
              height: "30px",
              width: "70%",
              background:
                "linear-gradient(to right,rgba(255,255,255),rgba(255,255,255,0))",
              flexDirection: "column",

              padding: "5px",
              paddingLeft: "40px",
              fontSize: "18px",
            }}
          >
            <a
              style={{
                color: "black",
              }}
            >
              Fields of Study&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date
              Range&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Author&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Journals & Conferences
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Sort by Relevance
            </a>
          </div>
        </div>
      </Sticky>

      <Container
        style={{
          backgroundSize: "100% 100%",
          //图片的路径
          // borderColor: "#fff",
          // paddingTop: "1em",
          // paddingBottom: "1em",
          width: "100%",
          height: "1600px",
          display: "flex",
          justifyContent: "center", //中间留白
          fontFamily: "Arial",
          fontWeight: "400",
        }}
      >
        {/* 头 */}
        <div
          style={{
            width: "73%",
            height: "85%",
            display: "flex",
            flexDirection: "column",
            padding: "30px",
            marginTop: "30px",
          }}
        >
          <Menu.Menu style={{}}>
            {data.map((i) => (
              <Link
                to={`/Details?item=${JSON.stringify(i)}`}
                style={{ color: "black" }}
              >
                <div>
                  <div style={{ margin: "30px 0" }}>
                    <text
                      style={{
                        fontWeight: "bold",
                        fontSize: "23px",
                      }}
                    >
                      {/* 标题 */}
                    </text>
                  </div>
                  <div>
                    <span>{i.category.name}</span>&nbsp;&nbsp;&nbsp;
                    <span>{i.dimension.name}</span>&nbsp;&nbsp;&nbsp;
                    {/* <span>{i.label}</span> */}
                  </div>
                  <div
                    style={{
                      marginTop: "20px",
                      fontSize: "20px",
                      color: "#ADADAD",
                    }}
                    dangerouslySetInnerHTML={{ __html: i.content }}
                  >
                    {}
                  </div>
                  <div
                    class="user"
                    style={{
                      width: "100%",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      marginTop: "30px",
                      // justifyContent: "center", //中间留白
                    }}
                  >
                    <div
                      style={{
                        marginTop: "10px",
                      }}
                    >
                      <img
                        src={`${process.env.PUBLIC_URL}/assets/headimg.png`}
                        style={{
                          display: "flex",
                          width: "30px",
                          height: "30px",
                          // float: " left",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        width: "950px",
                        height: "30px",
                        // float: " left",
                        marginLeft: "30px",
                        lineHeight: "30px",
                        color: "#ADADAD",
                        fontSize: "19px",
                      }}
                    >
                      <span>
                        {i.lastAuthor.substr(0, 10) +
                          "...." +
                          i.lastAuthor.substr(38)}
                      </span>
                      <span style={{ marginLeft: "20px" }}>
                        {moment(i.lastDate).format("YYYY-MM-DD")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* 第二个 */}

            {/* <div
              style={{
                marginTop: "80px",
              }}
            >
              <img
                src={`${process.env.PUBLIC_URL}/assets/bjt.jpg`}
                style={{
                  display: "flex",
                  width: "200px",
                  height: "150px",
                  float: " left",
                  padding: "10px",
                }}
              />
              <text
                style={{
                  fontWeight: "bold",
                  fontSize: "23px",
                  marginLeft: "20px",
                }}
              >
                An Overview of Blockchain Technology: Architecture, Consensus,
                and Future Trends
              </text>
              <div
                style={{
                  marginTop: "20px",
                  fontSize: "20px",
                  color: "#ADADAD",
                }}
              >
                An overview of blockchain architechture is provided and some
                typical consensus algorithms used in diferent block.chains are
                compared and possible future trends for blockchain are laid out
              </div>
              <div class="user">
                <div
                  style={{
                    marginTop: "10px",
                  }}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/assets/headimg.png`}
                    style={{
                      display: "flex",
                      width: "30px",
                      height: "30px",
                      float: " left",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "150px",
                    height: "30px",
                    float: " left",
                    marginLeft: "30px",
                    lineHeight: "30px",
                    color: "#ADADAD",
                    fontSize: "19px",
                  }}
                >
                  0x6804...be5c
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "150px",
                    height: "30px",
                    float: " left",
                    marginLeft: "30px",
                    lineHeight: "30px",
                    color: "#ADADAD",
                    fontSize: "19px",
                  }}
                >
                  2022-12-5 15:34
                </div>
              </div>
            </div> */}
          </Menu.Menu>
          {/* 中数据 */}
          <Menu.Menu
            style={{
              display: "flex",
              flexDirection: "column ",
              alignItems: "center",
            }}
          >
            {/* 分页 */}
            {/* <Pagination
              defaultCurrent={1}
              total={50}
              defaultPageSize={5}
              style={{
                marginTop: "70px",
                marginBottom: "70px",
              }}
            /> */}

            <div
              style={{
                backgroundColor: "#ADADAD",
                width: "100%",
                height: ".5px",
                marginTop: "25px",
              }}
            >
              {" "}
            </div>
          </Menu.Menu>
          <div
            style={{
              marginTop: "30px",
              width: "100%",
              fontWeight: "bold",
              fontSize: "25px",
            }}
          >
            No relevant topics found?
          </div>
          <Link to="/Create_" style={{ color: "black" }}>
            <div
              style={{
                width: "255px",
                height: "60px",
                background: "#fffc00" /* fallback for old browsers */,
                fontSize: "20px",
                //   fontFamily: "Microsoft YaHei",
                fontWeight: "bold",
                color: " #000000",
                textAlign: "center",
                lineHeight: "60px",
                borderRadius: "15px",
                borderTopLeftRadius: "0",
                marginTop: "30px",
                left: "30px",
              }}
            >
              START CREATE
            </div>
          </Link>
        </div>
      </Container>
      {/* <Sticky context={contextRef}>
      </Sticky> */}
      <Floor />
    </div>
  );
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
