import React, { createRef } from "react";
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import { SubstrateContextProvider, useSubstrateState } from "../substrate-lib";
import { DeveloperConsole } from "../substrate-lib/components";

import AccountSelector from "../AccountSelector";
import Floor from "../Floor";
import Balances from "../Balances";
import BlockNumber from "../BlockNumber";
import Events from "../Events";
import Interactor from "../Interactor";
import Metadata from "../Metadata";
import NodeInfo from "../NodeInfo";
// import TemplateModule from './TemplateModule'
import CicadaModule from "../CicadaModule";
import CicadaModule_ from "../CicadaModule_";
import Transfer from "../Transfer";
import Upgrade from "../Upgrade";

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
      {/* <Sticky context={contextRef}> */}
      <AccountSelector />
      {/* </Sticky> */}
      <Container>
        <Grid stackable columns="equal">
          {/* <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row> */}
          {/* <Grid.Row stretched>
            <Balances />
          </Grid.Row> */}
          {/* <Grid.Row>
            <Transfer />
            <Interactor /> */}
          {/* <Upgrade /> */}
          {/* </Grid.Row> */}
          <Grid.Row>
            {/* <CicadaModule /> */}
            <CicadaModule_ />
            {/* <Events /> */}
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
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
