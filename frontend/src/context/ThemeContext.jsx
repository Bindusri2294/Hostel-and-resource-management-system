import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portal-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('portal-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('bright-mode');
      document.documentElement.classList.remove('dark-mode');
    } else {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('bright-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isBright: theme === 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
};

const defaultThemeState = { theme: 'light', toggleTheme: () => {}, isBright: true };
export const useTheme = () => useContext(ThemeContext) || defaultThemeState;
