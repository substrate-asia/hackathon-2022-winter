import { useApi, useAccount } from '@gear-js/react-hooks';
import { Routing } from 'pages';
import {  ApiLoader } from 'components';
import { withProviders } from 'hocs';
import {SubContextProvider} from "./api/connect";
import 'bootstrap/dist/css/bootstrap.min.css';
import GlobalStyle from "./utils/GloablStyle";

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  const isAppReady = isApiReady && isAccountReady;
  return<SubContextProvider>
      <>
          <main>{isAppReady ? <Routing /> : <ApiLoader />}</main>
          <GlobalStyle />
      </>
    </SubContextProvider>

  ;
}

export const App = withProviders(Component);
