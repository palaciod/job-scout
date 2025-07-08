import express from 'express';
import cors from "cors";
import Jobs from "./controllers/jobs/index.js";

const port = 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/jobs', Jobs);

app.get('/', (req, res) => {
    console.log('i ran');
    return res.send('working...');
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});