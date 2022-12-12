import './App.css';
import Menu from './pages/Menu/Menu';
import React, { useEffect,IndexRoute,useState,useRef} from "react";
import 'antd/dist/antd.css';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import routers from "./router/routers";
import styled from 'styled-components';
import dfstyles from './style/style';
import { Provider } from 'react-redux';
import store from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './store/index';
import { initWallet } from '../substrate/walletManager';
import { initJsStore } from "../ui/store/db_table";
const _WindowWrapper = styled.div`
  overflow: hidden;
  display: flex;
  justify-content: flex-star;
  height: 100%;
  width: 100%;
  background:#111315;
  font-size: ${dfstyles.game.fontSize};
`;

function App() {
  useEffect(()=>{
    initWallet(1);
    initJsStore();
  },[])
  return (
    <Router>
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>     
        <div className="App">
          <_WindowWrapper>
            <Menu></Menu>
            <div className='main'>
              <div className='routers'>
                <Routes>
                  {
                    routers.map((item, index) => {
                      return (
                        <Route key={index} path={item.path} exact={item.exact} element={<item.component></item.component>}></Route>
                      )
                    })
                  }
                </Routes>
              </div>
              {/* <Routes></Routes> */}
            </div>
          </_WindowWrapper>
        </div>
        </PersistGate>
      </Provider>
    </Router>


  );
}

export default App;
