import { Request, Response } from "express";
import { Op } from "sequelize";

import DirectMessage from "../models/DirectMessage";
import Friendship from "../models/Friendship";
import User from "../models/User";

interface sendDirectMessageRequestBodyType {
	content: string;
	receiverId: number;
}

export const sendDirectMessage = async (
	req: Request<null, null, sendDirectMessageRequestBodyType> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { content, receiverId } = req.body;
		const senderId = parseInt(req.userId);

		if (!receiverId || !content) {
			return res.status(400).json({ error: "Receiver ID and content are required" });
		}

		// Check if they are friends
		const friendship = await Friendship.findOne({
			where: {
				[Op.or]: [
					{ userId1: senderId, userId2: receiverId },
					{ userId1: receiverId, userId2: senderId }
				]
			}
		});

		if (!friendship) {
			return res.status(403).json({ error: "Can only send messages to friends" });
		}

		// Create the direct message
		const directMessage = await DirectMessage.create({
			content,
			receiverId,
			senderId
		});

		// Fetch the message with sender details
		const messageWithSender = await DirectMessage.findByPk(directMessage.id, {
			include: [
				{
					as: 'sender',
					attributes: ['id', 'username'],
					model: User
				}
			]
		});

		// Emit socket event to both sender and receiver
		if (req.io) {
			console.log(`[DM] Emitting new_direct_message to sender ${senderId} and receiver ${receiverId}`);
			
			// Emit to sender's room
			req.io.to(`dm:${senderId}`).emit("new_direct_message", {
				directMessage: messageWithSender
			});
			
			// Emit to receiver's room
			req.io.to(`dm:${receiverId}`).emit("new_direct_message", {
				directMessage: messageWithSender
			});
		}

		return res.status(201).json({
			directMessage: messageWithSender,
			message: "Direct message sent successfully"
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const getConversation = async (
	req: Request<{ friendId: string }> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { friendId } = req.params;
		const userId = parseInt(req.userId);

		// Check if they are friends
		const friendship = await Friendship.findOne({
			where: {
				[Op.or]: [
					{ userId1: userId, userId2: parseInt(friendId) },
					{ userId1: parseInt(friendId), userId2: userId }
				]
			}
		});

		if (!friendship) {
			return res.status(403).json({ error: "Can only view conversations with friends" });
		}

		// Get messages between the two users
		const messages = await DirectMessage.findAll({
			include: [
				{
					as: 'sender',
					attributes: ['id', 'username'],
					model: User
				},
				{
					as: 'receiver',
					attributes: ['id', 'username'],
					model: User
				}
			],
			order: [['createdAt', 'ASC']],
			where: {
				[Op.or]: [
					{ receiverId: parseInt(friendId), senderId: userId },
					{ receiverId: userId, senderId: parseInt(friendId) }
				]
			}
		});

		return res.json({ messages });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllConversations = async (
	req: Request & {
		userId: string;
	},
	res: Response
) => {
	try {
		const userId = parseInt(req.userId);

		// Get user's friends
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

		// Get the latest message from each conversation
		const conversations = await Promise.all(
			(user as any).friends.map(async (friend: any) => {
				const latestMessage = await DirectMessage.findOne({
					include: [
						{
							as: 'sender',
							attributes: ['id', 'username'],
							model: User
						}
					],
					order: [['createdAt', 'DESC']],
					where: {
						[Op.or]: [
							{ receiverId: friend.id, senderId: userId },
							{ receiverId: userId, senderId: friend.id }
						]
					}
				});

				return {
					friend: {
						id: friend.id,
						username: friend.username
					},
					latestMessage: latestMessage ? {
						content: latestMessage.content,
						createdAt: latestMessage.createdAt,
						id: latestMessage.id,
						senderId: latestMessage.senderId,
						senderUsername: (latestMessage as any).sender.username
					} : null
				};
			})
		);

		// Filter out conversations with no messages and sort by latest message
		const conversationsWithMessages = conversations
			.filter(conv => conv.latestMessage)
			.sort((a, b) => 
				new Date(b.latestMessage!.createdAt).getTime() - 
				new Date(a.latestMessage!.createdAt).getTime()
			);

		return res.json({ conversations: conversationsWithMessages });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteDirectMessage = async (
	req: Request<{ messageId: string }> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { messageId } = req.params;
		const userId = parseInt(req.userId);

		const directMessage = await DirectMessage.findOne({
			where: { id: parseInt(messageId), senderId: userId }
		});

		if (!directMessage) {
			return res.status(404).json({ error: "Message not found or unauthorized" });
		}

		await directMessage.destroy();

		return res.json({ message: "Message deleted successfully" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Internal server error" });
	}
};
