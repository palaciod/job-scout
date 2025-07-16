import React, { useState } from "react";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const Card = ({ job, onDelete, onAdd, shouldAllowAdd }) => {

  const {
    title,
    company,
    summary,
    technologies,
    experienceLevel,
    applicants,
    remote,
    fit,
    timestamp,
    url,
  } = job;

  const handleDelete = () => {
    onDelete?.(url);
  };

  const handleAdd = () => {
    onAdd?.(url);
  };

  return (
    <>
      <MuiCard sx={{ width: "100%", position: "relative" }}>
        {shouldAllowAdd && (
          <IconButton
            onClick={handleAdd}
            sx={{ position: "absolute", top: 8, right: 40 }}
            size="small"
            color="primary"
            aria-label="add"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton
          onClick={handleDelete}
          sx={{ position: "absolute", top: 8, right: 8 }}
          size="small"
          color="error"
          aria-label="delete"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>

        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {company} • {remote} • {experienceLevel}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {summary}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {technologies.split(", ").map((tech) => (
              <Chip key={tech} label={tech} size="small" />
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Applicants: {applicants} • Fit: {fit} • Posted: {timestamp}
          </Typography>
        </CardContent>

        <CardActions>
          <Button
            size="small"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Job
          </Button>
        </CardActions>
      </MuiCard>
    </>
  );
};

export default Card;
