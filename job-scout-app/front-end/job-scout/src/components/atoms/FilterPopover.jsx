import React, { useState } from "react";
import { Popover, Box, Typography, TextField, MenuItem } from "@mui/material";

const FilterPopover = ({ anchorEl, onClose, open }) => {
  const [column, setColumn] = useState("hoursPassed");
  const [operator, setOperator] = useState("contains");
  const [value, setValue] = useState("");

  const isHoursFilter = column === "hoursPassed";

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      <Box sx={{ p: 2, minWidth: 300 }}>
        <TextField
          select
          label="Filter"
          fullWidth
          size="small"
          value={column}
          onChange={(e) => setColumn(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="JobTitle">Job Title</MenuItem>
          <MenuItem value="company">Company</MenuItem>
          <MenuItem value="tech">Technology</MenuItem>
          <MenuItem value="hoursPassed">
            Posted In Last
          </MenuItem>
        </TextField>

        {isHoursFilter ? (
          <TextField
            type="number"
            label="Hours"
            fullWidth
            size="small"
            placeholder="e.g. 2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <>
            <TextField
              select
              label="Operator"
              fullWidth
              size="small"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="equals">Equals</MenuItem>
            </TextField>
            <TextField
              label="Value"
              fullWidth
              size="small"
              placeholder="Filter value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </>
        )}
      </Box>
    </Popover>
  );
};

export default FilterPopover;
