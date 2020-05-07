require('dotenv').config();

import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

const { PORT } = process.env;

const app: express.Application = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
