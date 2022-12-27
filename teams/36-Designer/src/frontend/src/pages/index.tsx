import { Route, Routes } from 'react-router-dom';
// import { OnLogin, InfoText } from 'components';
// import { Create } from './create';
import Home from '../home';
import New from "../new";
import Contracts from "../Contract";
import Mine from "../Mine";
import Setting from "../setting";
import Detail from "../detail";

const routes = [
  { path: '/', Page: Home },
  { path: 'new', Page: New },
  { path: 'contracts', Page: Contracts },
  { path: 'mine', Page: Mine },
  { path: 'setting', Page: Setting },
  { path: 'detail/:id', Page: Detail },
];

function Routing() {
  const getRoutes = () =>
      routes.map(({ path, Page }) => (
          <Route
              key={path}
              path={path}
              element={
                <Page />
              }
          />
      ));

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing };
