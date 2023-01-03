import {
  RiskIcon,
  WalletIcon,
} from '../../style/iconfont';
import { Button, Menu } from 'antd';
import React, { useState,useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import './Menu.scss';
import logo from '../../images/logo.png';
import { connect} from 'react-redux';

const SiderMenu = (props) => {
  const {account}=props;
  // console.log(account)
  const items = [
    { label: 'Wallet', key: '/Wallet', icon: <WalletIcon /> },
    { label: 'Risk', key: '/RiskRecord', icon: <RiskIcon /> },
  ];
  const Navigate = useNavigate();
  const Location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');

  useEffect(() => {

    if(Location.pathname=='/'|| Location.pathname=='/Wallet'||Location.pathname=='/WalletHome'||Location.pathname=='/AssetsTabs'){
      setActiveMenu('/Wallet')
    }
    if(Location.pathname=='/RiskRecord'){
      setActiveMenu('/RiskRecord')
    }
    if(Location.pathname=='/RiskDetail'){
      setActiveMenu('/RiskDetail')
    }
    return () => {
    }
  }, [Location.pathname])
  const MenuRouter = (routers) => {
    if(account){
      if(routers.key=='/Wallet'){
        Navigate('/WalletHome')
      }else{
        Navigate(routers.key)
      }
    }else{
      Navigate(routers.key)
    }

 
  };

  return (
    <div
      style={{
        width: '300px',
        background: '#1A1C1E',
        height:'100vh'
      }}
    >
      <p className='Logo'><img src={logo}></img></p>
      <Menu className='menu' selectedKeys={[activeMenu]} onClick={MenuRouter} mode="inline" items={items} />

    </div>
  );
};
const mapStateToProps=(state)=>{
  return {account:state.account}
}
export default connect(mapStateToProps)(SiderMenu);