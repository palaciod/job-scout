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
import { useResume } from "../../contexts/ResumeContext";
import ResumeTextViewer from "../molecules/label/ResumeTextViewer";

const PdfUploader = ({ onFileSelect }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const { resumeText, updateResumeText } = useResume();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setPdfFile(file);
    onFileSelect?.(file);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("http://localhost:3000/resume/upload-pdf", {
        method: "POST",
        body: formData,
      });
      if (response?.status >= 300) {
        throw new Error('Failed to post resume');
      }
      const result = await response.json();
      updateResumeText(result?.text);
      console.log("Parsed PDF saved:", result);

    } catch (error) {
      console.error("Error uploading PDF:", error);
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
       <ResumeTextViewer text={resumeText ?? ""} />;
    </Paper>
  );
};

export default PdfUploader;
