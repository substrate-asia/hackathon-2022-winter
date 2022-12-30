import Index from "./views/index";
import Create from "./views/Create";
import Create_ from "./views/Create_";
import List from "./views/list";
import Picture from "./views/picture";
import Err from "./views/err";
import Record from "./views/record";
import Details from "./views/details";
import Proposed from "./views/proposed";
import Governance from "./views/governance";
import Subscription from "./views/Subscription";
import MORTGAGE from "./views/MORTGAGE";
import { Router, Route, Routes, Link } from "react-router-dom";

function App() {
  return (
    <div>
      <Route exact component={Index} path="/"></Route>

      <Route exact component={Create} path="/Create"></Route>
      <Route exact component={Create_} path="/Create_"></Route>
      <Route exact component={List} path="/List"></Route>
      <Route exact component={Picture} path="/Picture"></Route>
      <Route exact component={Err} path="/Err"></Route>
      <Route exact component={Record} path="/Record"></Route>
      <Route exact component={Proposed} path="/Proposed"></Route>
      <Route exact component={Governance} path="/Governance"></Route>
      <Route exact component={Details} path="/Details"></Route>
      <Route exact component={Subscription} path="/Subscription"></Route>
      <Route exact component={MORTGAGE} path="/MORTGAGE"></Route>
    </div>
  );
}

export default App;
