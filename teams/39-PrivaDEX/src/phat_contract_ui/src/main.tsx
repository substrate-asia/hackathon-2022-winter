import React from 'react'
import * as ReactDOM from "react-dom/client"

import GlobalStyles from './styles/global-styles'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById("root")!)
// root.render(
//   <React.StrictMode>
//     <GlobalStyles />
//     <App />
//   </React.StrictMode>
// )
root.render(
  <React.Fragment>
    <GlobalStyles />
    <App />
  </React.Fragment>
)
