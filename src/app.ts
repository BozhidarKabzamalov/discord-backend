import bodyParser from 'body-parser';
import express from "express";

import router from './routes/index.js';

const app = express();

app.use(bodyParser.json());

app.use(router);

app.listen(3000);