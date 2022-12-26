// @ts-nocheck
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { NftPage } from 'pages';

function MainApp() {
  return (
    <div className="main-app bg-primary">
      <div className="flex flex-col m-auto">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/nft/" replace />}
            exact
          />
          <Route path="/nft" element={<NftPage />} exact />
        </Routes>
      </div>
    </div>
  );
}

export default MainApp;
