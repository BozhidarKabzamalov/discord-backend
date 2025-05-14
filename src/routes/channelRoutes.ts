import { Router } from "express";

import {
	createChannel,
	deleteChannel,
	updateChannel,
} from "../controllers/ChannelController";
import authenticated from "../middleware/authenticated";
import checkRole from "../middleware/checkRole";

const router = Router();

router.post(
	"/servers/:serverId/channels",
	authenticated,
	checkRole(["owner", "admin"]),
	createChannel
);
router.delete(
	"/servers/:serverId/channels/:channelId",
	authenticated,
	checkRole(["owner", "admin"]),
	deleteChannel
);
router.put(
	"/servers/:serverId/channels/:channelId",
	authenticated,
	checkRole(["owner", "admin"]),
	updateChannel
);

export default router;
