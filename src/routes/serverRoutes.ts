import { Router} from "express";

import { createServer, deleteServer, joinServer, leaveServer, updateServer } from "../controllers/ServerController";
import authenticated from "../middleware/authenticated";
import checkRole from "../middleware/checkRole";

const router = Router();

router.post("/servers", authenticated, createServer);
router.post("/servers/:serverId/join", authenticated, joinServer);
router.post("/servers/:serverId/leave", authenticated, checkRole(['owner', 'admin', 'member']), leaveServer);
router.delete("/servers/:serverId", authenticated, checkRole(['owner']), deleteServer);
router.put("/servers/:serverId", authenticated, checkRole(['owner', 'admin']), updateServer);

export default router;