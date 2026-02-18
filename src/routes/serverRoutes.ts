import { Router } from "express";

import {
    createServer,
    deleteServer,
    getServersForUser,
    joinServer,
    leaveServer,
    updateServer,
} from "../controllers/ServerController";
import authenticated from "../middleware/authenticated";
import checkRole from "../middleware/checkRole";

const router = Router();

router.get("/servers", authenticated, getServersForUser);
router.post("/servers", authenticated, createServer);
router.post("/servers/join/:inviteCode", authenticated, joinServer);
router.post(
    "/servers/:serverId/leave",
    authenticated,
    checkRole(["owner", "admin", "member"]),
    leaveServer,
);
router.delete(
    "/servers/:serverId",
    authenticated,
    checkRole(["owner"]),
    deleteServer,
);
router.put(
    "/servers/:serverId",
    authenticated,
    checkRole(["owner", "admin"]),
    updateServer,
);

export default router;
