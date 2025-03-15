import bodyParser from "body-parser";
import express from "express";

import serverRoutes from "./routes/serverRoutes";
import userRoutes from "./routes/userRoutes";
import { createAssociations, synchronizeModels } from "./utils/associations";

const app = express();

app.use(bodyParser.json());

app.use(userRoutes);
app.use(serverRoutes);

app.listen(3000);

createAssociations();

/*synchronizeModels().catch(() => {
	console.log("hehe");
});*/