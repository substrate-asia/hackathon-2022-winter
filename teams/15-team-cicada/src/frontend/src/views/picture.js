/* eslint-disable jsx-a11y/alt-text */
import React, { createRef } from "react";
import { Link } from "react-router-dom";
import { Pagination } from 'antd';
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
import '../rxd/css.css';
import Floor from "../Floor";
import "../rxd/tp.js";
function Main() {
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

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
      <AccountSelector />
     
      </Sticky>
      
      <Container
        style={{
          backgroundSize: "100% 100%",
          //图片的路径
          // borderColor: "#fff",
          // paddingTop: "1em",
          // paddingBottom: "1em",
          width: "100%",
          height: "579px",
        //   marginRight: "-20px",
          backgroundColor:'#40454E',
          display: "flex",
        //   alignItems: "center",
          justifyContent: "center", //中间留白
        //   color: "#fff",
          fontFamily: "Arial",
          fontWeight: "400",
        //   textAlign: "center",
        }}
      >
        {/* 头 */}
        <div id="carousel">
						<ul className="picture">
							<li><img
                            src={`${process.env.PUBLIC_URL}/assets/Cicada.png`}   /></li>
							<li><img src={`${process.env.PUBLIC_URL}/assets/bjt.jpg`} /></li>
							<li><img src={`${process.env.PUBLIC_URL}/assets/Cicada.png`} /></li>
							<li><img src={`${process.env.PUBLIC_URL}/assets/bjt.jpg`} /></li>
							<li><img src={`${process.env.PUBLIC_URL}/assets/Cicada.png`} /></li>
							<li><img src={`${process.env.PUBLIC_URL}/assets/bjt.jpg`} /></li>
							<li><img src={`${process.env.PUBLIC_URL}/assets/Cicada.png`} /></li>
						</ul>
						<span className="pre">
							<div className="info_sprite"></div>
						</span>
						<span className="next">
							<div className="info_sprite"></div>
						</span>
						<span className="banner_bg"></span>
						<div className=" breviary">
							<ul className="follow">
								<li className="hover"><img src={`${process.env.PUBLIC_URL}/assets/Cicada.png`} /></li>
								<li><img src={`${process.env.PUBLIC_URL}/assets/bjt.jpg`} /></li>
								<li><img src={`${process.env.PUBLIC_URL}/assets/Cicada.png`} /></li>
								<li><img src={`${process.env.PUBLIC_URL}/assets/bjt.jpg`} /></li>
								<li><img src={`${process.env.PUBLIC_URL}/assets/Cicada.png`} /></li>
								<li><img src={`${process.env.PUBLIC_URL}/assets/bjt.jpg`} /></li>
								<li><img src={`${process.env.PUBLIC_URL}/assets/Cicada.png`} /></li>
							</ul>
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
