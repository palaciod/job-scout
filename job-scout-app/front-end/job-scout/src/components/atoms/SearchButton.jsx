import React, { useState } from "react";
import { Box, IconButton, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchButton = ({ onSearch }) => {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const handleBlur = () => {
    if (!query) {
      setExpanded(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {!expanded ? (
        <IconButton color="inherit" onClick={() => setExpanded(true)}>
          <SearchIcon />
        </IconButton>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #90caf9",
            borderRadius: 2,
            px: 1,
            width: { xs: "100%", sm: 250 },
            transition: "width 0.3s ease",
            backgroundColor: "#1e1e1e",
          }}
        >
          <SearchIcon sx={{ color: "#ccc", mr: 1 }} />
          <InputBase
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={handleBlur}
            placeholder="Search..."
            sx={{ color: "#fff", flex: 1 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default SearchButton;
