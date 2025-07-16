import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const LLM_API_URL = process.env.LLM_API;

const systemPrompt = `You are a job parsing and fit evaluation assistant. Given a job description, extract useful structured information and evaluate whether a candidate is a good fit.

The candidate has over 5 years of experience as a full stack developer, with expertise in JavaScript, Python, Node.js, and AWS.

Return a valid JSON object with the following fields:

{
  "title": string,
  "company": string,
  "technologies": string[],
  "experienceLevel": string, // "Entry", "Mid", or "Senior"
  "remote": boolean,
  "summary": string, // brief 1-2 sentence summary of the job's core responsibilities
  "applicantCount": number, // total number of applicants if listed
  "entryLevelPercent": number, // % of entry-level applicants if listed
  "seniorLevelPercent": number, // % of senior-level applicants if listed
  "yearsRequired": number | undefined, // years of experience required by the job, or undefined if not mentioned
  "fit": "Yes" | "No", // whether the candidate is a good fit
  "reason": string // a short explanation of the fit result
}

If a field is unknown or not mentioned in the job post, set it to null. For yearsRequired, use undefined if not specified. Only return a valid JSON object. Do not include markdown formatting, explanations, or extra notes.`;

function cleanJobText(text) {
  return text.replace(/See how you compare to other applicants/i, "").trim();
}

router.post("/evaluate-job", async (req, res) => {
  if (!LLM_API_URL) {
    return res.status(500).json({ error: "LLM_API not set in environment." });
  }

  const rawJobText = req.body?.text?.trim();
  if (!rawJobText) {
    return res.status(400).json({ error: "Missing or invalid 'text' field." });
  }

  const jobDescription = cleanJobText(rawJobText);

  try {
    const response = await fetch(LLM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3-8b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: jobDescription },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    console.log(data?.choices, "<---------->");

    let parsed = null;

    try {
      const match = raw.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
      let jsonText = match ? match[1] : raw;
      const firstBrace = jsonText.indexOf("{");
      const lastBrace = jsonText.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Could not find JSON object in LLM response.");
      }

      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
      jsonText = jsonText.replace(/\bundefined\b/g, "null");

      parsed = JSON.parse(jsonText);
      const dir = path.resolve("job-descriptions");
      const logFile = path.join(dir, "parsed-jobs.json");

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let existing = [];
      if (fs.existsSync(logFile)) {
        try {
          const content = fs.readFileSync(logFile, "utf8");
          existing = JSON.parse(content || "[]");
        } catch (e) {
          console.warn("⚠️ Could not parse existing parsed-jobs.json:", e);
          existing = [];
        }
      }

      existing.push({
        timestamp: new Date().toISOString(),
        url: req.body?.url ?? null,
        job: parsed,
      });

      fs.writeFileSync(logFile, JSON.stringify(existing, null, 2), "utf8");
      console.log("✅ Saved to parsed-jobs.json");
    } catch (err) {
      console.error("❌ Failed to parse LLM JSON:", raw);
      return res
        .status(500)
        .json({ error: "Invalid JSON returned by LLM.", raw });
    }

    return res.json({ parsed });
  } catch (err) {
    console.error("❌ LLM API call failed:", err);
    return res.status(500).json({ error: "LLM API call failed" });
  }
});

router.get("/", (req, res) => {
  const logFile = path.resolve("job-descriptions", "parsed-jobs.json");

  if (!fs.existsSync(logFile)) {
    return res.status(404).json({ message: "No jobs found." });
  }

  try {
    const content = fs.readFileSync(logFile, "utf8");
    const jobs = JSON.parse(content || "[]");

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found." });
    }

    return res.json({ jobs });
  } catch (err) {
    console.error("❌ Failed to read parsed-jobs.json:", err);
    return res.status(500).json({ error: "Failed to read jobs file." });
  }
});

router.post("/jobs/update-applied", async (req, res) => {
  const { url, applied } = req.body;

  if (typeof url !== "string" || typeof applied !== "boolean") {
    return res.status(400).json({ error: "Missing or invalid 'url' or 'applied' field." });
  }

  const logFile = path.resolve("job-descriptions", "parsed-jobs.json");

  if (!fs.existsSync(logFile)) {
    return res.status(404).json({ error: "No jobs file found." });
  }

  try {
    const content = fs.readFileSync(logFile, "utf8");
    const jobs = JSON.parse(content || "[]");

    let updated = false;

    const updatedJobs = jobs.map((jobEntry) => {
      if (jobEntry.url === url) {
        jobEntry.applied = applied;
        updated = true;
      }
      return jobEntry;
    });

    if (!updated) {
      return res.status(404).json({ error: "Job with given URL not found." });
    }

    fs.writeFileSync(logFile, JSON.stringify(updatedJobs, null, 2), "utf8");
    console.log(`✅ Updated 'applied' status for URL: ${url}`);

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to update applied status:", err);
    return res.status(500).json({ error: "Failed to update applied status." });
  }
});


router.delete("/remove", (req, res) => {
  const { url } = req.body;

  if (typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' field." });
  }

  const jobsFile = path.resolve("job-descriptions", "parsed-jobs.json");
  const trashFile = path.resolve("job-descriptions", "trashed-jobs.json");

  if (!fs.existsSync(jobsFile)) {
    return res.status(404).json({ error: "Jobs file not found." });
  }

  try {
    const jobsContent = fs.readFileSync(jobsFile, "utf8");
    const jobs = JSON.parse(jobsContent || "[]");

    const remainingJobs = [];
    let removedJob = null;

    for (const jobEntry of jobs) {
      if (jobEntry.url === url && !removedJob) {
        removedJob = jobEntry;
      } else {
        remainingJobs.push(jobEntry);
      }
    }

    if (!removedJob) {
      return res.status(404).json({ error: "Job with given URL not found." });
    }
    fs.writeFileSync(jobsFile, JSON.stringify(remainingJobs, null, 2), "utf8");
    console.log(`🗑️ Removed job with URL: ${url}`);

    if (!fs.existsSync(path.dirname(trashFile))) {
      fs.mkdirSync(path.dirname(trashFile), { recursive: true });
    }

    let trashedJobs = [];
    if (fs.existsSync(trashFile)) {
      try {
        const trashContent = fs.readFileSync(trashFile, "utf8");
        trashedJobs = JSON.parse(trashContent || "[]");
      } catch (e) {
        console.warn("⚠️ Could not parse trashed-jobs.json:", e);
      }
    }

    removedJob.trashedAt = new Date().toISOString();
    trashedJobs.push(removedJob);
    fs.writeFileSync(trashFile, JSON.stringify(trashedJobs, null, 2), "utf8");
    console.log("📦 Moved job to trashed-jobs.json");

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete and trash job:", err);
    return res.status(500).json({ error: "Failed to delete job." });
  }
});

// probably should create its own controller for this trash jobs

router.get("/get-trash-jobs", (req, res) => {
  const trashFile = path.resolve("job-descriptions", "trashed-jobs.json");

  if (!fs.existsSync(trashFile)) {
    return res.status(404).json({ message: "No trashed jobs found." });
  }

  try {
    const content = fs.readFileSync(trashFile, "utf8");
    const trashedJobs = JSON.parse(content || "[]");

    if (!Array.isArray(trashedJobs) || trashedJobs.length === 0) {
      return res.status(404).json({ message: "No trashed jobs found." });
    }

    return res.json({ jobs: trashedJobs });
  } catch (err) {
    console.error("❌ Failed to read trashed-jobs.json:", err);
    return res.status(500).json({ error: "Failed to read trashed jobs file." });
  }
});

router.delete("/delete-trashed-job", (req, res) => {
  const { url } = req.body;

  if (typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' field." });
  }

  const trashFile = path.resolve("job-descriptions", "trashed-jobs.json");

  if (!fs.existsSync(trashFile)) {
    return res.status(404).json({ error: "Trash file not found." });
  }

  try {
    const content = fs.readFileSync(trashFile, "utf8");
    let trashedJobs = JSON.parse(content || "[]");

    const initialLength = trashedJobs.length;
    trashedJobs = trashedJobs.filter((entry) => entry.url !== url);

    if (trashedJobs.length === initialLength) {
      return res.status(404).json({ error: "Trashed job with given URL not found." });
    }

    fs.writeFileSync(trashFile, JSON.stringify(trashedJobs, null, 2), "utf8");
    console.log(`🗑️ Permanently deleted trashed job with URL: ${url}`);

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete trashed job:", err);
    return res.status(500).json({ error: "Failed to delete trashed job." });
  }
});

router.post("/restore-trashed-job", (req, res) => {
  const { url } = req.body;

  if (typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' field." });
  }

  const jobsFile = path.resolve("job-descriptions", "parsed-jobs.json");
  const trashFile = path.resolve("job-descriptions", "trashed-jobs.json");

  if (!fs.existsSync(trashFile)) {
    return res.status(404).json({ error: "Trash file not found." });
  }

  try {
    const trashContent = fs.readFileSync(trashFile, "utf8");
    let trashedJobs = JSON.parse(trashContent || "[]");

    const index = trashedJobs.findIndex((entry) => entry.url === url);
    if (index === -1) {
      return res.status(404).json({ error: "Trashed job with given URL not found." });
    }

    const restoredJob = trashedJobs.splice(index, 1)[0];

    delete restoredJob.trashedAt;

    let existingJobs = [];
    if (fs.existsSync(jobsFile)) {
      const jobContent = fs.readFileSync(jobsFile, "utf8");
      existingJobs = JSON.parse(jobContent || "[]");
    }

    existingJobs.push({
      timestamp: new Date().toISOString(),
      url: restoredJob.url,
      job: restoredJob.job,
    });
    fs.writeFileSync(jobsFile, JSON.stringify(existingJobs, null, 2), "utf8");
    fs.writeFileSync(trashFile, JSON.stringify(trashedJobs, null, 2), "utf8");

    console.log(`♻️ Restored job with URL: ${url} back to parsed-jobs.json`);

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to restore job:", err);
    return res.status(500).json({ error: "Failed to restore trashed job." });
  }
});


export default router;
