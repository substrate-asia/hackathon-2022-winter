// import React from "react";
// import ReactDOM from "react-dom";
// import { BrowserRouter as Router } from "react-router-dom";
// import Index from "../src/views/index";
// import App from "./App";

// ReactDOM.render(
//   <React.StrictMode>
//     <Index />
//     {/* <App /> */}
//   </React.StrictMode>,
//   // <React.StrictMode>
//   //   <App />
//   // </React.StrictMode>,

//   document.getElementById("root")
// );
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { HashRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
