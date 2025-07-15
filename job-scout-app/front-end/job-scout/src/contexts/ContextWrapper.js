import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import { DrawerProvider } from "./DrawerContext";
import { JobDataProvider } from "./JobDataContext";
import { getTheme } from "../theme/theme";

const ContextWrapper = ({ children }) => {
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const theme = getTheme(prefersDarkMode ? "dark" : "light");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <DrawerProvider>
          <JobDataProvider>
            {children}
          </JobDataProvider>
        </DrawerProvider>
      </Router>
    </ThemeProvider>
  );
};

export default ContextWrapper;
