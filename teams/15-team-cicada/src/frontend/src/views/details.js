import React, { createRef } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "antd";
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
import AccountSelector from "../AccountSelector";
function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState();

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
        }}
      >
        <Menu.Menu style={{ with: "700px", margin: "20px 0" }}>
          <div style={{ fontWeight: "bold", fontSize: "34px" }}>
            Rchitecture, Consensus, and Future Trends
          </div>
          <div style={{ fontWeight: "bold", margin: "10px 0" }}>Origin</div>
          <div>
            Blockchain originated from Bitcoin. On November 1, 2008, a person
            who called himself Satoshi Nakamoto published the article Bitcoin: A
            Peer to Peer Electronic Cash System, which described the
            architecture concept of the electronic cash system based on P2P
            network technology, encryption technology, timestamp technology,
            blockchain technology, etc., marking the birth of Bitcoin. Two
            months later, the theory was put into practice, and the first
            Genesis block with serial number 0 was born on January 3, 2009. A
            few days later, on January 9, 2009, a block with a serial number of
            1 appeared and was connected with the Genesis block with a serial
            number of 0 to form a chain, marking the birth of the blockchain.
          </div>
          <div style={{ fontWeight: "bold", margin: "10px 0" }}>
            Concept definition
          </div>
          <div>
            Blockchain originated from Bitcoin. On November 1, 2008, a person
            who called himself Satoshi Nakamoto published the article Bitcoin: A
            Peer to Peer Electronic Cash System, which described the
            architecture concept of the electronic cash system based on P2P
            network technology, encryption technology, timestamp technology,
            blockchain technology, etc., marking the birth of Bitcoin. Two
            months later, the theory was put into practice, and the first
            Genesis block with serial number 0 was born on January 3, 2009. A
            few days later, on January 9, 2009, a block with a serial number of
            1 appeared and was connected with the Genesis block with a serial
            number of 0 to form a chain, marking the birth of the blockchain.
          </div>
          <div style={{ fontWeight: "bold", margin: "10px 0" }}>
            Development history
          </div>
          <div>
            Blockchain originated from Bitcoin. On November 1, 2008, a person
            who called himself Satoshi Nakamoto published the article Bitcoin: A
            Peer to Peer Electronic Cash System, which described the
            architecture concept of the electronic cash system based on P2P
            network technology, encryption technology, timestamp technology,
            blockchain technology, etc., marking the birth of Bitcoin. Two
            months later, the theory was put into practice, and the first
            Genesis block with serial number 0 was born on January 3, 2009. A
            few days later, on January 9, 2009, a block with a serial number of
            1 appeared and was connected with the Genesis block with a serial
            number of 0 to form a chain, marking the birth of the blockchain.
          </div>
          <div style={{ fontWeight: "bold", margin: "10px 0" }}>Origin</div>
          <div>
            Blockchain originated from Bitcoin. On November 1, 2008, a person
            who called himself Satoshi Nakamoto published the article Bitcoin: A
            Peer to Peer Electronic Cash System, which described the
            architecture concept of the electronic cash system based on P2P
            network technology, encryption technology, timestamp technology,
            blockchain technology, etc., marking the birth of Bitcoin. Two
            months later, the theory was put into practice, and the first
            Genesis block with serial number 0 was born on January 3, 2009. A
            few days later, on January 9, 2009, a block with a serial number of
            1 appeared and was connected with the Genesis block with a serial
            number of 0 to form a chain, marking the birth of the blockchain.
          </div>
          <div style={{ fontWeight: "bold", margin: "10px 0" }}>
            Architecture model
          </div>
          <div>
            Blockchain originated from Bitcoin. On November 1, 2008, a person
            who called himself Satoshi Nakamoto published the article Bitcoin: A
            Peer to Peer Electronic Cash System, which described the
            architecture concept of the electronic cash system based on P2P
            network technology, encryption technology, timestamp technology,
            blockchain technology, etc., marking the birth of Bitcoin. Two
            months later, the theory was put into practice, and the first
            Genesis block with serial number 0 was born on January 3, 2009. A
            few days later, on January 9, 2009, a block with a serial number of
            1 appeared and was connected with the Genesis block with a serial
            number of 0 to form a chain, marking the birth of the blockchain.
          </div>
          <div style={{ fontWeight: "bold", margin: "10px 0" }}>Origin</div>
          <div>
            Blockchain originated from Bitcoin. On November 1, 2008, a person
            who called himself Satoshi Nakamoto published the article Bitcoin: A
            Peer to Peer Electronic Cash System, which described the
            architecture concept of the electronic cash system based on P2P
            network technology, encryption technology, timestamp technology,
            blockchain technology, etc., marking the birth of Bitcoin. Two
            months later, the theory was put into practice, and the first
            Genesis block with serial number 0 was born on January 3, 2009. A
            few days later, on January 9, 2009, a block with a serial number of
            1 appeared and was connected with the Genesis block with a serial
            number of 0 to form a chain, marking the birth of the blockchain.
          </div>
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
              <div>0x6804...be5c</div>
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
