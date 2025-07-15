import React, { useState } from "react";
import { useJobData } from "../../../contexts/JobDataContext";
import ToolBar from "../../molecules/ToolBar/ToolBar";
import Card from "../../molecules/card/card";
import styles from "./JobBoard.module.css";
import { Box, CircularProgress, Typography, Container } from "@mui/material";

const JobBoard = () => {
  const [viewMode, setViewMode] = useState("grid");
  const { jobs, loading, error } = useJobData();

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

      {!loading && !error && jobs.length === 0 && (
        <Typography sx={{ mt: 2 }}>No jobs found.</Typography>
      )}
      <div className={`${styles.jobList} ${viewMode === "grid" ? styles.gridView : styles.listView}`}>
        {jobs.map((entry, index) => (
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
