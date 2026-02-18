import { Router } from "express";

import {
    demoteAdmin,
    kickMember,
    promoteMember,
} from "../controllers/MembershipController.js";
import authenticated from "../middleware/authenticated.js";
import checkRole from "../middleware/checkRole.js";

const router = Router();

router.patch(
    "/servers/:serverId/members/:userId/promote",
    authenticated,
    checkRole(["owner"]),
    promoteMember,
);

router.patch(
    "/servers/:serverId/members/:userId/demote",
    authenticated,
    checkRole(["owner"]),
    demoteAdmin,
);

router.delete(
    "/servers/:serverId/members/:userId",
    authenticated,
    checkRole(["owner", "admin"]),
    kickMember,
);

export default router;
