// @ts-nocheck
import { themeType } from 'constants/ThemeConstants';
import { localStorageKeys } from 'constants/LocalStorageConstants';
import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';


const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem(
      localStorageKeys.CurrentTheme
    );
    if (typeof storedPrefs === 'string') {
      return storedPrefs;
    }
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return themeType.Dark;
    }
  }

  return themeType.Light;
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ initialTheme, children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  const rawSetTheme = (theme) => {
    const root = window.document.documentElement;
    const isDark = theme === themeType.Dark;

    root.classList.remove(isDark ? themeType.Light : themeType.Dark);
    root.classList.add(theme);

    localStorage.setItem(localStorageKeys.CurrentTheme, theme);
  };

  if (initialTheme) {
    rawSetTheme(initialTheme);
  }

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  initialTheme: PropTypes.string,
  children: PropTypes.any
};
