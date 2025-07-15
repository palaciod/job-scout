import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js"; 
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ dest: "uploads/" });


router.get("/", async (req, res) => {
  const filePath = path.join(__dirname, "../parsed/resume.txt");

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "No parsed resume found" });
    }

    const text = fs.readFileSync(filePath, "utf-8");

    return res.status(200).json({ text });
  } catch (err) {
    console.error("❌ Error reading resume file:", err);
    return res.status(500).json({
      error: "Failed to read resume file",
      details: err.message,
    });
  }
});



router.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const outputDir = path.join(__dirname, "../parsed");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, "resume.txt");

    fs.writeFileSync(outputFile, pdfData.text);
    fs.unlink(req.file.path, () => {}); 

    return res.status(201).json({
      message: "PDF parsed and saved",
      outputFile: "parsed/resume.txt",
      text: pdfData.text,
    });
  } catch (err) {
    console.error("❌ Error parsing PDF:", err);
    return res.status(500).json({
      error: "Failed to parse PDF",
      details: err.message,
    });
  }
});



export default router;
