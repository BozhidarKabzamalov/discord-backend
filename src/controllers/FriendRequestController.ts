import { Request, Response } from "express";
import { Op } from "sequelize";

import FriendRequest from "../models/FriendRequest";
import Friendship from "../models/Friendship";
import User from "../models/User";

interface sendFriendRequestRequestBodyType {
	username: string;
}

export const sendFriendRequest = async (
	req: Request<null, null, sendFriendRequestRequestBodyType> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { username } = req.body;
		const senderId = parseInt(req.userId);

		if (!username) {
			return res.status(400).json({ error: "Username is required" });
		}

		// Find the user by username
		const receiver = await User.findOne({ where: { username } });
		if (!receiver) {
			return res.status(404).json({ error: "User not found" });
		}

		if (receiver.id === senderId) {
			return res.status(400).json({ error: "Cannot send friend request to yourself" });
		}

		// Check if friend request already exists
		const existingRequest = await FriendRequest.findOne({
			where: {
				[Op.or]: [
					{ receiverId: receiver.id, senderId },
					{ receiverId: senderId, senderId: receiver.id }
				]
			}
		});

		if (existingRequest) {
			return res.status(400).json({ error: "Friend request already exists" });
		}

		// Check if they are already friends
		const existingFriendship = await Friendship.findOne({
			where: {
				[Op.or]: [
					{ userId1: senderId, userId2: receiver.id },
					{ userId1: receiver.id, userId2: senderId }
				]
			}
		});

		if (existingFriendship) {
			return res.status(400).json({ error: "Users are already friends" });
		}

		// Create friend request
		const friendRequest = await FriendRequest.create({
			receiverId: receiver.id,
			senderId,
			status: 'pending'
		});

		return res.status(201).json({
			friendRequest,
			message: "Friend request sent successfully"
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const acceptFriendRequest = async (
	req: Request<{ requestId: string }> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { requestId } = req.params;
		const receiverId = parseInt(req.userId);

		const friendRequest = await FriendRequest.findOne({
			where: { id: parseInt(requestId), receiverId, status: 'pending' }
		});

		if (!friendRequest) {
			return res.status(404).json({ error: "Friend request not found" });
		}

		// Update request status to accepted
		await friendRequest.update({ status: 'accepted' });

		// Create friendship
		await Friendship.create({
			userId1: friendRequest.senderId,
			userId2: friendRequest.receiverId
		});

		return res.json({
			friendship: {
				userId1: friendRequest.senderId,
				userId2: friendRequest.receiverId
			},
			message: "Friend request accepted"
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const rejectFriendRequest = async (
	req: Request<{ requestId: string }> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { requestId } = req.params;
		const receiverId = parseInt(req.userId);

		const friendRequest = await FriendRequest.findOne({
			where: { id: parseInt(requestId), receiverId, status: 'pending' }
		});

		if (!friendRequest) {
			return res.status(404).json({ error: "Friend request not found" });
		}

		// Update request status to rejected
		await friendRequest.update({ status: 'rejected' });

		return res.json({ message: "Friend request rejected" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const getPendingFriendRequests = async (
	req: Request & {
		userId: string;
	},
	res: Response
) => {
	try {
		const userId = parseInt(req.userId);

		const pendingRequests = await FriendRequest.findAll({
			include: [
				{
					as: 'sender',
					attributes: ['id', 'username'],
					model: User
				}
			],
			where: { receiverId: userId, status: 'pending' }
		});

		return res.json({ pendingRequests });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const getSentFriendRequests = async (
	req: Request & {
		userId: string;
	},
	res: Response
) => {
	try {
		const userId = parseInt(req.userId);

		const sentRequests = await FriendRequest.findAll({
			include: [
				{
					as: 'receiver',
					attributes: ['id', 'username'],
					model: User
				}
			],
			where: { senderId: userId, status: 'pending' }
		});

		return res.json({ sentRequests });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const getFriendsList = async (
	req: Request & {
		userId: string;
	},
	res: Response
) => {
	try {
		const userId = parseInt(req.userId);

		const user = await User.findByPk(userId, {
			include: [
				{
					as: 'friends',
					attributes: ['id', 'username'],
					model: User,
					through: { attributes: [] }
				}
			]
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.json({ friends: user.friends });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const removeFriend = async (
	req: Request<{ friendId: string }> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { friendId } = req.params;
		const userId = parseInt(req.userId);

		const friendship = await Friendship.findOne({
			where: {
				[Op.or]: [
					{ userId1: userId, userId2: parseInt(friendId) },
					{ userId1: parseInt(friendId), userId2: userId }
				]
			}
		});

		if (!friendship) {
			return res.status(404).json({ error: "Friendship not found" });
		}

		// Delete the friendship
		await friendship.destroy();

		// Update any existing friend request to rejected
		await FriendRequest.update(
			{ status: 'rejected' },
			{
				where: {
					[Op.or]: [
						{ receiverId: parseInt(friendId), senderId: userId },
						{ receiverId: userId, senderId: parseInt(friendId) }
					]
				}
			}
		);

		return res.json({ message: "Friend removed successfully" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};
