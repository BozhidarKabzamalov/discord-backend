import { Request, Response } from "express";
import { Op } from "sequelize";
import { Server as SocketIOServer } from "socket.io";

import Category from "../models/Category";
import Channel from "../models/Channel";
import ChannelMessage from "../models/ChannelMessage";
import Membership from "../models/Membership";
import Server from "../models/Server";
import User from "../models/User";

export const createChannelMessage = async (
	req: Request & { io: SocketIOServer; userId: string; },
	res: Response
) => {
	try {
		const { channelId } = req.params;
		const { content } = req.body;
		const userId = req.userId;
		const io = req.io;

		if (!content || typeof content !== "string") {
			return res
				.status(400)
				.json({ message: "Message content is required" });
		}

		const channel = await Channel.findOne({
			include: [
				{
					as: "category",
					include: [
						{
							as: "server",
							include: [
								{
									as: "memberships",
									model: Membership,
									required: true,
									where: { userId },
								},
							],
							model: Server,
							required: true,
						},
					],
					model: Category,
					required: true,
				},
			],
			where: { id: channelId },
		});

		if (!channel) {
			return res.status(403).json({
				message: "Channel not found or access denied",
			});
		}

		const message = await ChannelMessage.create({
			channelId,
			content,
			userId,
		});

		const messageWithAuthor = await ChannelMessage.findByPk(message.id, {
			include: [
				{
					as: "user",
					attributes: ["id", "username"],
					model: User,
				},
			],
		});

		const room = `channel:${channelId}`;
		// Emit the new message to all clients in that room
		io.to(room).emit("new_message", messageWithAuthor);

		return res.status(201).json({ message: messageWithAuthor });
	} catch (err) {
		console.log("Error creating message:", err);
		return res.status(500).json({ message: "Failed to create message" });
	}
};

export const getChannelMessages = async (req: Request, res: Response) => {
	try {
		const { channelId } = req.params;

		if (isNaN(Number(channelId))) {
			return res.status(400).json({ message: "Invalid channel ID" });
		}

		const messages = await ChannelMessage.findAll({
			attributes: ["id", "content", "createdAt", "updatedAt"],
			include: [
				{
					as: "user",
					attributes: ["id", "username"],
					model: User,
				},
			],
			order: [["createdAt", "DESC"]],
			where: { channelId },
		});

		return res.status(200).json({ messages });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteChannelMessage = async (
	req: Request & { io: SocketIOServer; userId: string },
	res: Response
) => {
	try {
		const { messageId } = req.params;
		const userId = req.userId; // Assuming userId is a number to match the DB
		const io = req.io;

		const message = await ChannelMessage.findByPk(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		if (message.userId === Number(userId)) {
			const room = `channel:${message.channelId}`;
			io.to(room).emit("deleted_message", messageId);

			await message.destroy();
			return res.status(204).send();
		}

		const channel = await Channel.findByPk(message.channelId, {
			include: [
				{
					model: Category,
					as: "category",
					attributes: ["id"],
					include: [
						{
							model: Server,
							as: "server",
							attributes: ["id"],
						},
					],
				},
			],
		});

		if (!channel?.category?.server) {
			return res
				.status(404)
				.json({ error: "Channel or Server not found" });
		}

		const membership = await Membership.findOne({
			where: {
				[Op.or]: [{ roleId: 1 }, { roleId: 2 }],
				serverId: channel.category.server.id,
				userId: Number(userId),
			},
		});

		if (membership) {
			const room = `channel:${channel.id}`;
			io.to(room).emit("deleted_message", messageId);

			await message.destroy();

			return res
				.status(200)
				.json({ message: "Message successfully deleted" });
		}

		return res.status(403).json({
			error: "Only message authors, server owners, or admins can delete messages",
		});
	} catch (error) {
		console.error("Error deleting message:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const updateChannelMessage = async (req: Request, res: Response) => {
	try {
		const { messageId } = req.params;
		const { content } = req.body;
		const userId = req.userId;

		if (!messageId || !content) {
			return res.status(400).json({
				error: "Message ID and content are required",
			});
		}

		const message = await ChannelMessage.findByPk(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		if (message.userId !== userId) {
			return res.status(403).json({
				error: "You can only edit your own messages",
			});
		}

		const updatedMessage = await message.update({ content });

		return res.status(200).json(updatedMessage);
	} catch (error) {
		console.error("Error updating message:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};
