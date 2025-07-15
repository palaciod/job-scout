import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profilePath = path.join(__dirname, "../data/profile.json");

router.get("/", (req, res) => {
  if (!fs.existsSync(profilePath)) {
    return res.status(404).json({ error: "No saved profile found" });
  }

  try {
    const fileContent = fs.readFileSync(profilePath, "utf-8");
    const profile = JSON.parse(fileContent);
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: "Failed to read profile file" });
  }
});

router.post("/theme", express.json(), (req, res) => {
  const { theme } = req.body;

  if (theme && theme !== "light" && theme !== "dark") {
    return res.status(400).json({ error: "Invalid theme value" });
  }

  let existingProfile = {};
  if (fs.existsSync(profilePath)) {
    try {
      const fileContent = fs.readFileSync(profilePath, "utf-8");
      existingProfile = JSON.parse(fileContent);
    } catch (err) {
      return res.status(500).json({ error: "Failed to read existing profile" });
    }
  }

  const updatedProfile = {
    ...existingProfile,
    ...(theme && { theme })
  };

  try {
    fs.writeFileSync(profilePath, JSON.stringify(updatedProfile, null, 2), "utf-8");
    return res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

export default router;
