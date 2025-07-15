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
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { useDrawer } from "../contexts/DrawerContext";

const drawerItems1 = ["Inbox", "Starred", "Send email", "Drafts"];
const drawerItems2 = ["All mail", "Trash", "Spam"];

const Layout = ({ children }) => {
  const { open, closeDrawer } = useDrawer();

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={closeDrawer}>
      <List>
        {drawerItems1.map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {drawerItems2.map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
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

      {/* Main content */}
      <Box component="main" sx={{ p: 3, mt: 6 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
