import React, { useState } from "react";
import { useJobData } from "../../../contexts/JobDataContext";
import ToolBar from "../../molecules/ToolBar/ToolBar";
import Card from "../../molecules/card/card";
import styles from "./JobBoard.module.css";
import { Box, CircularProgress, Typography, Container } from "@mui/material";

const JobBoard = () => {
  const [viewMode, setViewMode] = useState("grid");
  const { jobs, filteredJobs, loading, error } = useJobData();

  const getJobs = () => {
    return filteredJobs?.length === 0 ? jobs : filteredJobs;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 1 }}>
      <ToolBar
        title="Job Board"
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
          <Box sx={{ fontSize: 48 }}>🔍</Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            No jobs match your search
          </Typography>
          <Typography variant="body2">
            Try adjusting your filters or clearing your search.
          </Typography>
        </Box>
      )}

      <div
        className={`${styles.jobList} ${
          viewMode === "grid" ? styles.gridView : styles.listView
        }`}
      >
        {getJobs().map((entry, index) => (
          <Card
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
    </Container>
  );
};

export default JobBoard;
