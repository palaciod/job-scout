import express from "express";
import fs from 'fs';
import path from 'path';

const router = express.Router();

const LLM_API_URL = "http://127.0.0.1:1234/v1/chat/completions";

const systemPrompt = `You are a job fit evaluator. The candidate is a full stack developer with 4 years of experience in JavaScript, Python, Node.js, and AWS. Determine whether the candidate is a good fit for the job post. Respond only with "Yes" or "No", followed by a short explanation.`;


router.post('/dump-job', (req, res) => {
    const content = req.body.text;
    const dir = path.resolve('job-descriptions');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(dir, `job-${timestamp}.txt`);

    fs.writeFileSync(filename, content, 'utf8');

    console.log('Saved job description to', filename);
    res.send('Dumped and saved.');
});

router.post("/evaluate-job", async (req, res) => {
  const jobDescription = req.body?.text;

  if (!jobDescription || typeof jobDescription !== "string") {
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
    const answer = data?.choices?.[0]?.message?.content || "No response from model.";
    res.json({ result: answer.trim() });
  } catch (error) {
    console.error("Error calling LLM API:", error);
    res.status(500).json({ error: "Failed to evaluate job description." });
  }
});

export default router;