// @ts-nocheck
import React from 'react';
import AppRouter from 'AppRouter';
import { ThemeProvider } from 'contexts/themeContext';
import { KeyringContextProvider } from './contexts/keyringContext';

function App() {
  return (
    <KeyringContextProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </KeyringContextProvider>
  );
}

export default App;
