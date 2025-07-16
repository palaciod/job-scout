import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const ResumeTextViewer = ({ text }) => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Resume
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {text}
      </Paper>
    </Box>
  );
};

export default ResumeTextViewer;
