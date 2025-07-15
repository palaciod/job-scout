import React from "react";
import { Container, Typography, Box } from "@mui/material";
import BlockedList from "../../organisms/BlockedList/BlockedList";
import DrawerButton from "../../atoms/DrawerButton";

const BlockedCompanies = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <DrawerButton />
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Blocked Companies
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Add or remove companies to run your bot
        </Typography>
      </Box>

      <BlockedList />
    </Container>
  );
};

export default BlockedCompanies;
