import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import { DrawerProvider } from "./DrawerContext";
import { JobDataProvider } from "./JobDataContext";
import { ThemeModeProvider } from "./ThemeContext";
import { ResumeProvider } from "./ResumeContext";

const ContextWrapper = ({ children }) => {
  return (
    <ThemeModeProvider>
      {(theme) => (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <DrawerProvider>
              <ResumeProvider>
                <JobDataProvider>{children}</JobDataProvider>
              </ResumeProvider>
            </DrawerProvider>
          </Router>
        </ThemeProvider>
      )}
    </ThemeModeProvider>
  );
};

export default ContextWrapper;
