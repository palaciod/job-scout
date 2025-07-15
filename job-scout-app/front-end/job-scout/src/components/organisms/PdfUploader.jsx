import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";

const PdfUploader = ({ onFileSelect }) => {
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      onFileSelect?.(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    onFileSelect?.(null);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        border: "2px dashed #90caf9",
        borderRadius: 4,
        backgroundColor: "#1a1c22",
        position: "relative",
      }}
    >
      <Box textAlign="center">
        <input
          accept="application/pdf"
          type="file"
          id="pdf-upload"
          hidden
          onChange={handleFileChange}
        />
        <label htmlFor="pdf-upload">
          <Box sx={{ cursor: "pointer" }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: "#1976d2" }} />
            <Typography variant="h6" color="textSecondary">
              Click or drag to upload PDF
            </Typography>
          </Box>
        </label>

        {pdfFile && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            mt={2}
          >
            <PictureAsPdfIcon color="error" />
            <Typography>{pdfFile.name}</Typography>
            <IconButton onClick={removeFile} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default PdfUploader;
