import { Router} from "express";

import { createServer } from "../controllers/ServerController";
import authenticated from "../middleware/authenticated";

const router = Router();

router.post("/server", authenticated, createServer);

export default router;