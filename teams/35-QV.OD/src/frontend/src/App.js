import GlobalStyle from "./utils/GloablStyle";
import RouterLink from "./router/router";
import { HashRouter as Router } from "react-router-dom";
import { SubstrateContextProvider} from './api/contracts';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
      <div >
          <SubstrateContextProvider>
            <Router>
              <RouterLink />
            </Router>
            <GlobalStyle />
          </SubstrateContextProvider>
      </div>

  );
}

export default App;
