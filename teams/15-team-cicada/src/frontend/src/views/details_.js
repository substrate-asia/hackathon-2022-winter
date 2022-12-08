import React, { createRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getList } from "../request/governance";

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
// 获取数据方法函数

function Main() {
  const getApiData = async () => {
    try {
      let list = await getList();
      console.log(list);
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
  const { apiState, apiError, keyringState } = useSubstrateState();

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

  if (apiState === "ERROR") return message(apiError);
  else if (apiState !== "READY") return loader("Connecting to Substrate");

  if (keyringState !== "READY") {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const contextRef = createRef();

  //请求函数
  //   list.map((item, index) => {
  return (
    <div ref={contextRef}>
      {/* <Sticky context={contextRef}> */}
      {/* <AccountSelector /> */}
      {/* </Sticky> */}
      <Container
        style={{
          backgroundSize: "100% 100%",
          backgroundImage:
            "url(" + `${process.env.PUBLIC_URL}/assets/bg2.png` + ")", //图片的路径
          // borderColor: "#fff",
          // paddingTop: "1em",
          // paddingBottom: "1em",
          width: "100%",
          height: "1000px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center", //中间留白
          color: "#fff",
          fontFamily: "Arial",
          fontWeight: "400",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#fff" }}>sadasdasdasdasdas</div>
      </Container>
      {/* <Sticky context={contextRef}>
      </Sticky> */}
      <Floor />
    </div>
  );
  //   });
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
