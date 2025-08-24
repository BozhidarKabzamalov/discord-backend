import { Router } from "express";

import {
	deleteDirectMessage,
	getAllConversations,
	getConversation,
	sendDirectMessage
} from "../controllers/DirectMessageController";
import authenticated from "../middleware/authenticated";

const router = Router();

router.post("/direct-messages/send", authenticated, sendDirectMessage);

router.get("/direct-messages/conversation/:friendId", authenticated, getConversation);

router.get("/direct-messages/conversations", authenticated, getAllConversations);

router.delete("/direct-messages/:messageId", authenticated, deleteDirectMessage);

export default router;
