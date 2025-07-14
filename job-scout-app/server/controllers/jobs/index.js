import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const LLM_API_URL = process.env.LLM_API;

const systemPrompt = `You are a job fit evaluator. The candidate is a full stack developer with 4 years of experience in JavaScript, Python, Node.js, and AWS. Determine whether the candidate is a good fit for the job post. Respond only with "Yes" or "No", followed by a short explanation.`;

const matchLogPath = path.resolve("job-descriptions", "matches.json");

const ensureJobDir = () => {
  const dir = path.resolve("job-descriptions");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

router.post("/evaluate-job", async (req, res) => {
  if (!LLM_API_URL) {
    return res.status(500).json({ error: "LLM_API not set in environment." });
  }

  const jobDescription = req.body?.text?.trim();
  if (!jobDescription) {
    return res.status(400).json({ error: "Missing or invalid 'text' field." });
  }

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
    const resultText = data?.choices?.[0]?.message?.content?.trim() || "No response from model.";

    if (resultText.toLowerCase().startsWith("yes")) {
      ensureJobDir();
      let matches = [];
      if (fs.existsSync(matchLogPath)) {
        const content = fs.readFileSync(matchLogPath, "utf8");
        matches = JSON.parse(content || "[]");
      }
      matches.push({
        timestamp: new Date().toISOString(),
        jobDescription,
        llmResponse: resultText,
      });

      fs.writeFileSync(matchLogPath, JSON.stringify(matches, null, 2), "utf8");
      console.log("✅ Match logged to matches.json");
    }

    res.json({ result: resultText });
  } catch (error) {
    console.error("Error calling LLM API:", error);
    res.status(500).json({ error: "Failed to evaluate job description." });
  }
});

export default router;
