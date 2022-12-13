<<<<<<< HEAD
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
=======
import Index from "./views/index";
import Create from "./Create";
import List from "./views/list";
import Picture from "./views/picture";
import { Link, Route, Switch } from "react-router-dom";
>>>>>>> 40fd283826b2af44dbbd14fba4bd50730977e68a

import { SubstrateContextProvider, useSubstrateState } from "./substrate-lib";
import { DeveloperConsole } from "./substrate-lib/components";

import AccountSelector from "./AccountSelector";
import Floor from "./Floor";
import Balances from "./Balances";
import BlockNumber from "./BlockNumber";
import Events from "./Events";
import Interactor from "./Interactor";
import Metadata from "./Metadata";
import NodeInfo from "./NodeInfo";
// import TemplateModule from './TemplateModule'
import CicadaModule from "./CicadaModule";
import Transfer from "./Transfer";
import Upgrade from "./Upgrade";

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
<<<<<<< HEAD
    <div ref={contextRef}>
      {/* <Sticky context={contextRef}> */}
      <AccountSelector />
      {/* </Sticky> */}
      <Container>
        <Grid stackable columns="equal">
          <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row>
          <Grid.Row stretched>
            <Balances />
          </Grid.Row>
          <Grid.Row>
            <Transfer />
            <Interactor />
            {/* <Upgrade /> */}
          </Grid.Row>
          <Grid.Row>
            <CicadaModule />
            <Events />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
      {/* <Sticky context={contextRef}>
      </Sticky> */}
      <Floor />
=======
    <div>
      {/* <div>
        <p> */}
      <Route exact component={Index} path="/"></Route>
      {/* </p>
        <p> */}
      <Route exact component={Create} path="/Create"></Route>
      <Route exact component={List} path="/List"></Route>
      <Route exact component={Picture} path="/Picture"></Route>
      {/* </p>
      </div> */}
      {/* <hr /> */}
      {/* <div>
        <Switch>
          <Route exact component={Index} path="/"></Route>

          <Route
            exact
            component={Create}
            path="/substrate-front-end-template/Create"
          ></Route>
        </Switch>
      </div> */}
>>>>>>> 40fd283826b2af44dbbd14fba4bd50730977e68a
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
