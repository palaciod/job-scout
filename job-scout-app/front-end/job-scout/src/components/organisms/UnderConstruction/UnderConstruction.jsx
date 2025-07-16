import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useNavigate } from "react-router-dom";

const UnderConstruction = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={2}>
      <Stack spacing={2} alignItems="center">
        <ConstructionIcon
          sx={{ fontSize: 64, animation: "shake 1s infinite" }}
        />
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Under Construction
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We’re working hard to finish this section. Please check back soon!
        </Typography>
        <CircularProgress color="primary" />
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </Stack>

      <style>
        {`
          @keyframes shake {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default UnderConstruction;
