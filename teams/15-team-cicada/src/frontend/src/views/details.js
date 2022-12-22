import React, { createRef } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "antd";
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
  Form,
  Icon,
  Label,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import { SubstrateContextProvider, useSubstrateState } from "../substrate-lib";
import { DeveloperConsole } from "../substrate-lib/components";

import Floor from "../Floor";
import AccountSelector from "../AccountSelector";
function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState();
  const { search, state = {} } = useLocation();
  // 获取location.search中的参数
  const { item } = qs.parse(search.replace(/^\?/, ""));
  const obj = JSON.parse(item);
  console.log(obj);
  const loader = (text) => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  );
  const text_ = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
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
  const { Panel } = Collapse;
  const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
  const contextRef = createRef();

  return (
    <div ref={contextRef} style={{ display: "flex", flexDirection: "column" }}>
      {/* <Sticky context={contextRef}> */}
      <AccountSelector />
      {/* </Sticky> */}
      <Container
        style={{
          fontSize: "16px",
          fontFamily: "Arial",
          fontWeight: "400",
          color: "#000000",
          width: "1108px",
          height: "auto",
          fontFamily: "Arial",
          textAlign: "left",
          display: "flex",
          minHeight: "700px",
        }}
      >
        <Menu.Menu></Menu.Menu>

        <Menu.Menu style={{ width: "780px", margin: "20px 0" }}>
          <Form.Field style={{ margin: "20px 0 " }}>
            <Label basic color="teal">
              <Icon name="hand point right" />
              blockHash: {obj.blockHash}
            </Label>
          </Form.Field>
          <div style={{ fontWeight: "bold", fontSize: "34px" }}>
            {obj.category.name}
          </div>
          <div style={{ fontWeight: "bold", margin: "10px 0" }}>
            {obj.dimension.name}
          </div>
          <div style={{ textIndent: "2em" }}>{obj.content}</div>
        </Menu.Menu>
        <Menu.Menu>
          <div
            style={{
              width: " 250px",
              height: "auto",
              backgroundColor: "#F0F0F0 ",
              margin: "30px 0 0 90px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between", //中间留白
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/assets/headimg.png`}
              alt=""
              style={{
                width: "60px",
                height: "60px",
                position: "absolute",
                top: "-30px",
                left: "100px",
              }}
            />
            <div
              style={{
                textAlign: "center",
                marginTop: "50px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div>
                {obj.lastAuthor.substr(0, 10) +
                  "...." +
                  obj.lastAuthor.substr(38)}
              </div>
              <div
                style={{
                  width: "166px",
                  height: "40px",
                  backgroundColor: "#FFE48A",
                  lineHeight: "40px",
                  textAlign: "center",
                  margin: "0 0 20px 0 ",
                }}
              >
                DONATION
              </div>
              <div>All his subject</div>
            </div>
            <Collapse accordion>
              <Panel header="This is panel header 1" key="1">
                <p>{text}</p>
              </Panel>
              <Panel header="This is panel header 2" key="2">
                <p>{text}</p>
              </Panel>
              <Panel header="This is panel header 3" key="3">
                <p>{text}</p>
              </Panel>
            </Collapse>
          </div>
        </Menu.Menu>

        {/* 头 */}
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
