import { Router } from "express";

import {
    createChannelMessage,
    deleteChannelMessage,
    getChannelMessages,
    updateChannelMessage,
} from "../controllers/ChannelMessageController";
import authenticated from "../middleware/authenticated";

const router = Router();

router.get("/channels/:channelId/messages", authenticated, getChannelMessages);
router.post(
    "/channels/:channelId/messages",
    authenticated,
    createChannelMessage,
);
router.delete(
    "/channels/:channelId/messages/:messageId",
    authenticated,
    deleteChannelMessage,
);
router.put(
    "/channels/:channelId/messages/:messageId",
    authenticated,
    updateChannelMessage,
);

export default router;
