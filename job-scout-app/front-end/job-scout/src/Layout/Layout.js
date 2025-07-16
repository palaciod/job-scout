import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import HomeIcon from "@mui/icons-material/Home";
import BlockIcon from "@mui/icons-material/Block";
import SettingsIcon from "@mui/icons-material/Settings";
import { useDrawer } from "../contexts/DrawerContext";
import { useProfile } from "../contexts/ProfileContext";

const drawerItems1 = [
  { text: "Home", icon: <HomeIcon />, route: "/" },
  { text: "Applied", icon: <ArticleIcon />, route: "/applied" },
  { text: "Upload Resume", icon: <UploadFileIcon />, route: "/upload-resume" },
  {
    text: "Blocked Companies",
    icon: <BlockIcon />,
    route: "/blocked-companies",
  },
  { text: "Trash", icon: <DeleteIcon />, route: "/trash" },
];

const drawerItems2 = [
  { text: "Light/Dark", icon: <DarkModeIcon />, route: "/" },
  { text: "Delete All", icon: <DeleteSweepIcon />, route: "/delete-all" },
  { text: "Settings", icon: <SettingsIcon />, route: "/settings" },
];

const Layout = ({ children }) => {
  const { open, closeDrawer } = useDrawer();
  const { toggleTheme } = useProfile();

  const renderDrawerItems = (items) =>
    items.map(({ text, icon, route }) => {
      const isToggleTheme = text === "Light/Dark";

      return (
        <ListItem key={text} disablePadding>
          <ListItemButton
            component={route && !isToggleTheme ? Link : "button"}
            to={!isToggleTheme ? route : undefined}
            onClick={() => {
              closeDrawer();
              if (isToggleTheme) toggleTheme();
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        </ListItem>
      );
    });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Drawer open={open} onClose={closeDrawer}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>{renderDrawerItems(drawerItems1)}</List>
          <Divider />
          <List>{renderDrawerItems(drawerItems2)}</List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ p: 3, mt: 6 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
