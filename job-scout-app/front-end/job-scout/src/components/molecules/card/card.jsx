import React from "react";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

const Card = ({ job }) => {
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

  return (
    <MuiCard sx={{ width: "100%" }}>
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
  );
};

export default Card;
