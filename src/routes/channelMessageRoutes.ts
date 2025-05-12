import { Router } from "express";

import {
	createChannelMessage,
	deleteChannelMessage,
	getChannelMessages,
} from "../controllers/ChannelMessageController";
import authenticated from "../middleware/authenticated";

const router = Router();

router.get("/channels/:channelId/messages", authenticated, getChannelMessages);
router.post(
	"/channels/:channelId/messages",
	authenticated,
	createChannelMessage
);
router.delete(
	"/channels/:channelId/messages/messageId",
	authenticated,
	deleteChannelMessage
);

export default router;
