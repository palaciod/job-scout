import React, { useState } from "react";
import { useJobData } from "../../../contexts/JobDataContext";
import ToolBar from "../../molecules/ToolBar/ToolBar";
import Card from "../../molecules/card/card";
import styles from "./JobBoard.module.css";
import { useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography, Container } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";

const JobBoard = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackBardMessage, setSnackBarMessage] = useState("");

  const [viewMode, setViewMode] = useState("grid");
  const location = useLocation();
  const isTrashView = location.pathname === "/trash";

  const {
    jobs,
    filteredJobs,
    loading,
    error,
    removeJob,
    trash,
    filteredTrash,
    removeTrashedJob,
    fetchTrashedJobs,
    restoreTrashedJob,
  } = useJobData();

  const getJobs = () => {
    return filteredJobs?.length === 0 ? jobs : filteredJobs;
  };
  //   weird bug happens when we mix both jobs and trash. Combines both into one for some reason
  const getTrashJobs = () => {
    return filteredTrash?.length === 0 ? trash : filteredTrash;
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 1 }}>
      <ToolBar
        title={isTrashView ? "Trash Bin" : "Job Board"}
        className="job-toolbar"
        viewMode={viewMode}
        toggleView={() =>
          setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
        }
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Failed to load jobs: {error.message}
        </Typography>
      )}

      {!loading && !error && getJobs().length === 0 && (
        <Box
          sx={{
            mt: 4,
            textAlign: "center",
            color: "#aaa",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box sx={{ fontSize: 48 }}>🗑️</Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            No {isTrashView ? "trashed" : ""} jobs found
          </Typography>
          <Typography variant="body2">
            {isTrashView
              ? "Your trash is empty."
              : "Try adjusting your filters or clearing your search."}
          </Typography>
        </Box>
      )}
      {isTrashView ? (
        <div
          className={`${styles.jobList} ${
            viewMode === "grid" ? styles.gridView : styles.listView
          }`}
        >
          {getTrashJobs().map((entry, index) => (
            <Card
              shouldAllowAdd
              onAdd={() => {
                restoreTrashedJob(entry.url);
                setSnackBarMessage("Re added job");
                setSnackbarOpen(true);
              }}
              key={`${entry.url}-${index}`}
              onDelete={() => {
                removeTrashedJob(entry.url);
                setSnackBarMessage("Removed Job");
                fetchTrashedJobs();

              }}
              job={{
                url: entry.url,
                company: entry.job.company,
                title: entry.job.title || "Job Title Not Provided",
                summary: entry.job.summary,
                technologies: (entry.job.technologies || []).join(", "),
                experienceLevel: entry.job.experienceLevel || "N/A",
                applicants: entry.job.applicantCount,
                remote: entry.job.remote ? "Remote" : "On-site",
                fit: entry.job.fit,
                timestamp: new Date(entry.timestamp).toLocaleDateString(),
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className={`${styles.jobList} ${
            viewMode === "grid" ? styles.gridView : styles.listView
          }`}
        >
          {getJobs().map((entry, index) => (
            <Card
              key={`${entry.url}-${index}`}
              onDelete={() => {
                removeJob(entry.url);
                fetchTrashedJobs();
                 setSnackbarOpen(true);
              }}
              job={{
                url: entry.url,
                company: entry.job.company,
                title: entry.job.title || "Job Title Not Provided",
                summary: entry.job.summary,
                technologies: (entry.job.technologies || []).join(", "),
                experienceLevel: entry.job.experienceLevel || "N/A",
                applicants: entry.job.applicantCount,
                remote: entry.job.remote ? "Remote" : "On-site",
                fit: entry.job.fit,
                timestamp: new Date(entry.timestamp).toLocaleDateString(),
              }}
            />
          ))}
        </div>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackBardMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Container>
  );
};

export default JobBoard;
