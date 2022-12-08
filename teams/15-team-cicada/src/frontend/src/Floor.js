/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from "react";

import {
  Menu,
  Button,
  Dropdown,
  Container,
  Icon,
  Image,
  Label,
} from "semantic-ui-react";

import { useSubstrate, useSubstrateState } from "./substrate-lib";

function Main(props) {
  return (
    <Menu
      attached="top"
      tabular
      style={{
        backgroundColor: "#000",
        marginTop:'0',
        marginbBottom:'0',
        // paddingTop: "1em",
        // paddingBottom: "1em",
        width: "100%",

        height: "180px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", //中间留白
      }}
    >
      <Container
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", //中间留白
        }}
      >
        <Menu.Menu>
          <img
            src={`${process.env.PUBLIC_URL}/assets/Cicada.png`}
            style={{
              width: "163px",
              height: "35px",
            }}
          />
          <div
            style={{
              marginTop: "10px",
              fontSize: "17px",
              fontFamily: "Arial",
              fontWeight: "400",
              color: " #FFFFFF",
            }}
          >
            Let people learn blockchain easily
          </div>
        </Menu.Menu>
        <Menu.Menu>
          <div
            style={{
              textAlign: "right",
              float: "right",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontFamily: "Arial",
                fontWeight: "400",
                color: "#FFFFFF",
              }}
            >
              Collaborators & Attributions Terms of Service Privacy Pol
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ color: "#999999" }}>
                Copyright 2022,Made By Cicada
              </div>
              <div style={{ color: "#999999" }}>
                All trademarks and copyrights belong to their respective owners
              </div>
            </div>
          </div>
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

export default function Floor(props) {
  const { api, keyring } = useSubstrateState();
  return keyring.getPairs && api.query ? <Main {...props} /> : null;
}
