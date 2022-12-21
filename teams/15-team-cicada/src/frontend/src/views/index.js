import React, { createRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../src/css/index.css";
import { useHistory } from "react-router-dom";

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

import { SubstrateContextProvider, useSubstrateState } from "../substrate-lib";
import { DeveloperConsole } from "../substrate-lib/components";
import Floor from "../Floor";

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState();
  const [inputValue, setInputValue] = useState("");
  // const onChange = (_, data) =>
  //   setinputVal((prev) => ({ ...prev, [data.state]: data.value }));
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
  let history = useHistory();
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
      {/* <Sticky context={contextRef}> */}
      {/* <AccountSelector /> */}
      {/* </Sticky> */}

      <Container
        style={{
          color: "#fff",
          fontFamily: "Arial",
          fontWeight: "400",
          textAlign: "center",
          width: "100%",
          height: "1500px",
          backgroundSize: "100% 100%",
          backgroundImage:
            "url(" + `${process.env.PUBLIC_URL}/assets/bg2.png` + ")",
        }}
      >
        <div
          className="headBox"
          style={{
            height: "150px",
          }}
        >
          <div
            className="head_text"
            style={{ color: "#FFE178" }}
            onClick={function () {
              history.push("/Record");
            }}
          >
            Browse Records
          </div>
          <div className="head_text">Mortgage</div>
          <div className="head_text">Subscription</div>
          <div className="headimg_zh">
            <img
              src={`${process.env.PUBLIC_URL}/assets/headimg.png`}
              alt=""
              width="50px"
              height="50px"
            />
            <span>0x6804...be5c</span>
          </div>
          <div className="ConnectWallet"> Connect Wallet</div>
        </div>
        <div
          style={{
            //图片的路径
            // borderColor: "#fff",
            // paddingTop: "1em",
            // paddingBottom: "1em",

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center", //中间留白
          }}
        >
          {/* 头 */}
          <div
            style={{
              width: "700px",
              height: "85%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between", //中间留白
              marginTop: "40px",
            }}
          >
            <Menu.Menu style={{}}>
              <img
                src={`${process.env.PUBLIC_URL}/assets/Cicada.png`}
                style={{
                  width: "297px",
                  height: "63px",
                }}
              />
              <div
                style={{
                  fontSize: "30px",
                  marginTop: "15px",
                }}
              >
                Let people learn blockchain easily
              </div>

              <div
                class="ui action input"
                style={{
                  width: "821px",
                  height: "60px",
                  marginLeft: "40px",
                  margin: "30px 0 15px 0",
                }}
              >
                <input
                  type="text"
                  placeholder="Search blockchain knowledge based on subject"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                />
                <Link to={`/List?val=${inputValue}`} style={{ color: "black" }}>
                  <button
                    class="ui icon button"
                    style={{
                      width: "140px",
                      height: "60px",
                      backgroundColor: "#FFE178",
                      fontSize: "21px",
                      cursor: "pointer",
                      color: "#091323",
                    }}
                  >
                    <i
                      class="search icon"
                      style={{
                        fontSize: "21px",
                        display: "inline-block",
                      }}
                    ></i>
                    <span>Search</span>
                  </button>
                </Link>
              </div>

              <div style={{}}>
                Hot：Parallel chain, Slot auction, Substrate, Subquery, Polkadot
              </div>
            </Menu.Menu>
            {/* 中数据 */}
            <Menu.Menu
              style={{
                display: "flex",
                flexDirection: "column ",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "700px",
                  height: "auto",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around", //中间留白
                  marginTop: "140px",
                }}
              >
                <div>
                  <div style={{ fontSize: "30px" }}>26,821,501 </div>
                  <div
                    style={{
                      fontSize: "24px",
                      color: "#999",
                      marginTop: "15px",
                    }}
                  >
                    Subject
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "30px" }}>26,821,501 </div>
                  <div
                    style={{
                      fontSize: "24px",
                      color: "#999",
                      marginTop: "15px",
                    }}
                  >
                    Editor
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "30px" }}>26,821,501 </div>
                  <div
                    style={{
                      fontSize: "24px",
                      color: "#999",
                      marginTop: "15px",
                    }}
                  >
                    Author
                  </div>
                </div>
              </div>

              <Link to="/Create_" style={{ color: "black" }}>
                <div
                  style={{
                    width: "255px",
                    height: "60px",
                    background: "#fffc00" /* fallback for old browsers */,
                    fontSize: "20px",
                    fontFamily: "Microsoft YaHei",
                    fontWeight: "bold",
                    color: " #000000",
                    textAlign: "center",
                    lineHeight: "60px",
                    borderRadius: "15px",
                    borderTopLeftRadius: "0",
                    marginTop: "20px",
                    cursor: "pointer",
                  }}
                >
                  START CREATE
                </div>
              </Link>
            </Menu.Menu>
            <Menu.Menu
              style={{
                width: "503px",
                height: "305px",
                backgroundSize: "100% 100%",
                flexDirection: "column ",
                alignItems: "center",
                backgroundImage:
                  "url(" +
                  `${process.env.PUBLIC_URL}/assets/news-bar-bg.png` +
                  ")",
                width: "750px",

                marginTop: "70px",
                fontSize: "30px",
                textAlign: "center ",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "15px",
                  marginTop: "70px",
                }}
              >
                What Is Cicada?
              </div>
              <div style={{ fontSize: "16px", lineHeight: "24px" }}>
                Developed in-house, our state-of-the-art models process and
                classify papers in our pipeline. We distribute open code and
                datasets while publishing results of our research in the areas
                of Natural Language Processing, Machine Learning, Human Computer
                Interaction, and Information Retrieval.
                <div style={{ color: "#E2C76B" }}>More ----></div>
              </div>
            </Menu.Menu>
            <Menu.Menu>
              <div
                class="ui fluid icon input"
                style={{
                  width: "357px",
                  height: "47px",
                  backgroundColor: "#000",
                  border: "1px solid #8188BF",
                  marginTop: "120px",
                }}
              >
                <input
                  type="text"
                  placeholder="Your E-mail Address"
                  style={{
                    backgroundColor: "#000",
                  }}
                />
                <i class="search icon"></i>
                <span
                  style={{
                    display: "lineHeight",
                    width: "134px",
                    height: "47px",
                    color: "#fff",
                    textAlign: "center",
                    lineHeight: "47px",
                    border: "1px solid #FFE178",
                  }}
                >
                  SUBSCRIBE
                </span>
              </div>
            </Menu.Menu>
            <div></div>
          </div>
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
