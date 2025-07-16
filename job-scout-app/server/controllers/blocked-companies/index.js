import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blockedDir = path.join(__dirname, "../../data/blocked-companies");
const blockedPath = path.join(blockedDir, "blocked.json");

const ensureBlockedDirExists = () => {
  if (!fs.existsSync(blockedDir)) {
    fs.mkdirSync(blockedDir, { recursive: true });
  }
};

router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(blockedPath)) {
      return res.status(200).json({ companies: [] }); 
    }

    const data = fs.readFileSync(blockedPath, "utf-8");
    const companies = JSON.parse(data);

    if (!Array.isArray(companies)) {
      return res.status(500).json({ error: "Invalid data format in blocked.json" });
    }

    res.status(200).json({ companies });
  } catch (err) {
    console.error("Error reading blocked.json:", err);
    res.status(500).json({ error: "Failed to read blocked companies" });
  }
});


router.post("/", express.json(), (req, res) => {
  const { company } = req.body;

  if (!company || typeof company !== "string") {
    return res.status(400).json({ error: "Expected a 'company' string in the request body" });
  }

  try {
    ensureBlockedDirExists();

    let companies = [];
    if (fs.existsSync(blockedPath)) {
      const data = fs.readFileSync(blockedPath, "utf-8");
      companies = JSON.parse(data);
    }

    // Prevent duplicates (case-insensitive)
    const alreadyExists = companies.some(c => c.toLowerCase() === company.toLowerCase());
    if (alreadyExists) {
      return res.status(200).json({ message: "Company already blocked" });
    }

    companies.push(company);
    fs.writeFileSync(blockedPath, JSON.stringify(companies, null, 2), "utf-8");

    res.status(200).json({ success: true, companies });
  } catch (err) {
    console.error("Error writing to blocked.json:", err);
    res.status(500).json({ error: "Failed to block company" });
  }
});


router.delete("/", (req, res) => {
  const companyToRemove = req.query.name;

  if (!companyToRemove || typeof companyToRemove !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'name' query parameter" });
  }

  try {
    if (!fs.existsSync(blockedPath)) {
      return res.status(404).json({ error: "Blocked list not found" });
    }

    const data = fs.readFileSync(blockedPath, "utf-8");
    let companies = JSON.parse(data);

    if (!Array.isArray(companies)) {
      return res.status(500).json({ error: "Invalid data format in blocked.json" });
    }

    const originalLength = companies.length;
    companies = companies.filter(c => c.toLowerCase() !== companyToRemove.toLowerCase());

    if (companies.length === originalLength) {
      return res.status(404).json({ error: "Company not found in list" });
    }

    fs.writeFileSync(blockedPath, JSON.stringify(companies, null, 2), "utf-8");

    res.status(200).json({ success: true, message: `"${companyToRemove}" removed from blocked list.` });
  } catch (err) {
    console.error("Error deleting company from blocked list:", err);
    res.status(500).json({ error: "Failed to delete company" });
  }
});


export default router;
