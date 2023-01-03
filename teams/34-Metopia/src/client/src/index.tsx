import React from 'react';
import { CookiesProvider } from 'react-cookie';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import AlertModal from './component/modals/AlertModal';
import LoadingModal from './component/modals/LoadingModal';
import ProfileCompleteModal from './component/modals/ProfileCompleteModal';
import { Menu } from './component/modules/Menu';
import store from './config/redux';
import './index.scss';

const Index = () => {
  return (
    <div className="root"  >
      <CookiesProvider>
        <BrowserRouter basename="">
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/beta" element={<App />} />
            <Route path="/beta/:page" element={<App />} />
            <Route path="/beta/:page/:param1" element={<App />} />
            <Route path="/beta/:page/:param1/:param2" element={<App />} />
            <Route path="/beta/:page/:param1/:param2/:param3" element={<App />} />
          </Routes>
        </BrowserRouter>
        <LoadingModal />
        <ProfileCompleteModal />
        <AlertModal />
        <div className="menu-container">
          <div className="wrapper">
            <Menu active={1} />
          </div>
        </div>
        <use />
        <ToastContainer
          position="top-right"
          autoClose={8000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored" />
      </CookiesProvider >
    </div >
  )
}

ReactDOM.render(
  <Provider store={store}> <Index /></Provider>,
  document.getElementById('root')
);
