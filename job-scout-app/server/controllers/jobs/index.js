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


export default router;
