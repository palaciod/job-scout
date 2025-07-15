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
import ArticleIcon from "@mui/icons-material/Article";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import HomeIcon from '@mui/icons-material/Home';
import BlockIcon from "@mui/icons-material/Block";
import SettingsIcon from "@mui/icons-material/Settings";
import { useDrawer } from "../contexts/DrawerContext";

const drawerItems1 = [
    { text: "Home", icon: <HomeIcon /> },
  { text: "Applied", icon: <ArticleIcon /> },
  { text: "Upload Resume", icon: <UploadFileIcon /> },
  { text: "Blocked Companies", icon: <BlockIcon /> },
  { text: "Trash", icon: <DeleteIcon /> },
];

const drawerItems2 = [
  { text: "Light/Dark", icon: <DarkModeIcon /> },
  { text: "Delete All", icon: <DeleteSweepIcon /> },
  { text: "Settings", icon: <SettingsIcon /> },
];

const Layout = ({ children }) => {
  const { open, closeDrawer } = useDrawer();

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={closeDrawer}>
      <List>
        {drawerItems1.map(({ text, icon }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {drawerItems2.map(({ text, icon }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Drawer open={open} onClose={closeDrawer}>
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{ p: 3, mt: 6 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
