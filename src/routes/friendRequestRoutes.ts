import { Router } from "express";

import {
    acceptFriendRequest,
    getFriendsList,
    getPendingFriendRequests,
    getSentFriendRequests,
    rejectFriendRequest,
    removeFriend,
    sendFriendRequest,
} from "../controllers/FriendRequestController";
import authenticated from "../middleware/authenticated";

const router = Router();

router.post("/friend-requests/send", authenticated, sendFriendRequest);

router.put(
    "/friend-requests/:requestId/accept",
    authenticated,
    acceptFriendRequest,
);

router.put(
    "/friend-requests/:requestId/reject",
    authenticated,
    rejectFriendRequest,
);

router.get("/friend-requests/pending", authenticated, getPendingFriendRequests);

router.get("/friend-requests/sent", authenticated, getSentFriendRequests);

router.get("/friend-requests/friends", authenticated, getFriendsList);

router.delete(
    "/friend-requests/friends/:friendId",
    authenticated,
    removeFriend,
);

export default router;
