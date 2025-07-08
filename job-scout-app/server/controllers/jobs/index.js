import express from "express";
import fs from 'fs';
import path from 'path';

const router = express.Router();

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

export default router;