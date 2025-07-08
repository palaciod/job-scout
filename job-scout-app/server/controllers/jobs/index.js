import express from "express";

const router = express.Router();

router.post('/dump-job', (req, res) => {
    return res.send('dumping job...');
});

export default router;