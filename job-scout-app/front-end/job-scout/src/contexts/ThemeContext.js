// contexts/ThemeContext.js
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { getTheme } from "../theme/theme";

const ThemeModeContext = createContext();

export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeModeProvider = ({ children }) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [mode, setMode] = useState(prefersDark ? "dark" : "light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      {children(theme)}
    </ThemeModeContext.Provider>
  );
};
