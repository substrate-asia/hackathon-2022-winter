import Index from "./views/index";
import Create from "./Create";
import List from "./views/list";
import Picture from "./views/picture";
<<<<<<< HEAD
import Err from "./views/err";
import Record from "./views/record";
import Proposed from "./views/proposed";
import Governance from "./views/governance";
=======
import Details_ from "./views/details_";
import Details from "./views/details";
>>>>>>> 90595af75b5328246b6b59af2af21d6a79c15ffd
import { Link, Route, Switch } from "react-router-dom";

function App() {
  return (
    <div>
      {/* <div>
        <p> */}
      <Route exact component={Index} path="/"></Route>
      {/* </p>
        <p> */}
      <Route exact component={Create} path="/Create"></Route>
      <Route exact component={List} path="/List"></Route>
      <Route exact component={Picture} path="/Picture"></Route>
<<<<<<< HEAD
      <Route exact component={Err} path="/Err"></Route>
      <Route exact component={Record} path="/Record"></Route>
      <Route exact component={Proposed} path="/Proposed"></Route>
      <Route exact component={Governance} path="/Governance"></Route>
=======
      <Route exact component={Details} path="/Details"></Route>
      <Route exact component={Details_} path="/Details_"></Route>
>>>>>>> 90595af75b5328246b6b59af2af21d6a79c15ffd
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
    </div>
  );
}

export default App;
