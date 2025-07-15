import React from "react";
import { Container, Typography, Box } from "@mui/material";
import PdfUploader from "../../organisms/PdfUploader";
import DrawerButton from "../../atoms/DrawerButton";

const UploadPage = () => {
  const handlePdf = (file) => {
    console.log("Uploaded PDF:", file);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6, position: "relative" }}>
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <DrawerButton />
      </Box>

      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Your Resume
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          We’ll analyze your PDF to find your best job matches
        </Typography>
      </Box>

      <PdfUploader onFileSelect={handlePdf} />
    </Container>
  );
};

export default UploadPage;
