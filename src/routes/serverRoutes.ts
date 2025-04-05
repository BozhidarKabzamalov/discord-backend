import { Router } from "express";

import { createChannelMessage, deleteChannelMessage, getChannelMessages, updateChannelMessage } from "../controllers/ChannelMessageController";
import {
	createServer,
	deleteServer,
	joinServer,
	leaveServer,
	updateServer,
} from "../controllers/ServerController";
import authenticated from "../middleware/authenticated";
import checkRole from "../middleware/checkRole";

const router = Router();

router.post("/servers", authenticated, createServer);
router.post("/servers/:serverId/join", authenticated, joinServer);
router.post(
	"/servers/:serverId/leave",
	authenticated,
	checkRole(["admin", "member"]),
	leaveServer
);
router.delete(
	"/servers/:serverId",
	authenticated,
	checkRole(["owner"]),
	deleteServer
);
router.put(
	"/servers/:serverId",
	authenticated,
	checkRole(["owner", "admin"]),
	updateServer
);

router.post(
	"/servers/:serverId/channels/:channelId/messages",
	authenticated,
	checkRole(["owner", "admin", "member"]),
	createChannelMessage
);

router.get(
	"/servers/:serverId/channels/:channelId/messages",
	authenticated,
	checkRole(["owner", "admin", "member"]),
	getChannelMessages
);

router.delete(
	"/servers/:serverId/channels/:channelId/messages",
	authenticated,
	checkRole(["owner", "admin", "member"]),
	deleteChannelMessage
);

router.put(
	"/servers/:serverId/channels/:channelId/messages",
	authenticated,
	checkRole(["owner", "admin", "member"]),
	updateChannelMessage
);

export default router;
