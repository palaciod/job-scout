import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from "cors";
import Jobs from "./controllers/jobs/index.js";
import Resume from "./controllers/resume/index.js";
import Profile from "./controllers/profile/index.js";
import BlockedList from "./controllers/blocked-companies/index.js";
import Bot from "./controllers/bot/index.js";


const port = 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/jobs', Jobs);
app.use('/resume', Resume);
app.use('/profile', Profile);
app.use('/blocked', BlockedList);
app.use('/bot', Bot);


app.get('/', (req, res) => {
    console.log('i ran');
    return res.send('working...');
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});