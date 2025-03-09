import bodyParser from 'body-parser';
import express from "express";

import userRoutes from "./routes/userRoutes";

const app = express();

app.use(bodyParser.json());

app.use(userRoutes);

app.listen(3000);