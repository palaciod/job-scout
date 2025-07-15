import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import FilterListIcon from "@mui/icons-material/FilterList";
import GetAppIcon from "@mui/icons-material/GetApp";
import DrawerButton from "../../atoms/DrawerButton";
import FilterPopover from "../../atoms/FilterPopover";
import SearchButton from "../../atoms/SearchButton";
import { useJobData } from "../../../contexts/JobDataContext";

const ToolBar = ({
  title = "Toolbar",
  className = "",
  sx = {},
  viewMode,
  toggleView,
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const isFilterOpen = Boolean(filterAnchorEl);
  const { applySearch } = useJobData();

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#1e1e1e", boxShadow: 0, ...sx }}
        className={className}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <DrawerButton />
          <Typography variant="h6" color="white">
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" onClick={toggleView}>
              {viewMode === "grid" ? <ViewListIcon /> : <ViewModuleIcon />}
            </IconButton>
            <IconButton color="inherit" onClick={handleFilterClick}>
              <FilterListIcon />
            </IconButton>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, borderColor: "gray" }}
            />
            <IconButton color="inherit">
              <GetAppIcon />
            </IconButton>
            <SearchButton onSearch={(query) => applySearch(query)} />
          </Box>
        </Toolbar>
      </AppBar>

      <FilterPopover
        open={isFilterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
      />
    </>
  );
};

export default ToolBar;
