import React from "react";
import {  Typography, IconButton, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CompanyCard = ({ name, onRemove }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        borderRadius: 2,
        backgroundColor: "#dc3636ff",
      }}
    >
      <Typography variant="body1">{name}</Typography>
      <IconButton size="small" onClick={onRemove}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export default CompanyCard;
