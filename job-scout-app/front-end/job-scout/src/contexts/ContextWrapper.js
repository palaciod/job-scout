import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import { DrawerProvider } from "./DrawerContext";
import { JobDataProvider } from "./JobDataContext";
import { ResumeProvider } from "./ResumeContext";
import { ProfileProvider, useProfile } from "./ProfileContext";

const AppWithTheme = ({ children }) => {
  const { theme } = useProfile();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>{children}</Router>
    </ThemeProvider>
  );
};

const ContextWrapper = ({ children }) => {
  return (
    <ProfileProvider>
      <AppWithTheme>
        <DrawerProvider>
          <ResumeProvider>
            <JobDataProvider>{children}</JobDataProvider>
          </ResumeProvider>
        </DrawerProvider>
      </AppWithTheme>
    </ProfileProvider>
  );
};

export default ContextWrapper;
