// @ts-nocheck
import React from 'react';
import AccountSelect from 'components/Accounts/AccountSelect';
import Menu from 'components/Menu/DotMenu';
// import Navs from './Navs';
import { NFTNavs } from './Navs';
// import ChainSelector from './ChainSelector';
import SignerConnectionStatusLabel from './SignerConnectionStatusLabel';

export const CalamariNavbar = () => {
  return (
    <div className="h-20 py-4 px-10 flex justify-between items-center relative sticky left-0 right-0 top-0 z-50 bg-primary">
      {/* <ChainSelector /> */}
      {/* <Navs /> */}
      <div className="h-12 gap-4 flex justify-end items-center">
        <AccountSelect />
        <Menu />
      </div>
      <div className="absolute inset-0 border-b pointer-events-none bg-slate-600 border-gray-600 translate-y-0" />
    </div>
  );
};

export const DolphinNavbar = () => {
  return (
    <div className="h-20 py-4 px-10 flex justify-between items-center relative sticky left-0 right-0 top-0 z-50 bg-primary">
      {/* <ChainSelector /> */}
      {/* <Navs /> */}
      <div className="h-12 gap-4 flex justify-end items-center">
        <SignerConnectionStatusLabel />
        <Menu />
      </div>
    </div>
  );
};

export const NFTNavbar = () => {
  return (
    <div className="h-20 py-4 px-10 flex justify-between items-center relative sticky left-0 right-0 top-0 z-50 bg-primary">
      {/* <ChainSelector /> */}
      <NFTNavs/>
      <div className="h-12 gap-4 flex justify-end items-center">
        <SignerConnectionStatusLabel />
        <Menu />
      </div>
    </div>
  );
}