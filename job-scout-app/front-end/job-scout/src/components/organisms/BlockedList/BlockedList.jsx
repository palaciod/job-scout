import React, { useState } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import CompanyCard from "../../molecules/card/CompanyCard";
const BlockedList = () => {
  const [tags, setTags] = useState(["React", "Node.js", "AWS", "TypeScript"]);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInput("");
    }
  };

  const handleRemove = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Box>
      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="Add Company"
          variant="outlined"
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button variant="contained" onClick={handleAdd}>
          Add
        </Button>
      </Box>

      <Stack spacing={1}>
        {tags.map((tag) => (
          <CompanyCard key={tag} name={tag} onRemove={() => handleRemove(tag)} />
        ))}
      </Stack>
    </Box>
  );
};

export default BlockedList;
