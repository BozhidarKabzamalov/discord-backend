import { Request, Response } from "express";

import Channel from "../models/Channel";
import ChannelMessage from "../models/ChannelMessage";
import Membership from "../models/Membership";
import Server from "../models/Server";
import User from "../models/User";

export const createChannelMessage = async (
	req: Request & { userId: string },
	res: Response
) => {
	try {
		const { channelId } = req.params;
		const { content } = req.body;
		const userId = req.userId;

		if (!content || typeof content !== "string") {
			return res
				.status(400)
				.json({ message: "Message content is required" });
		}

		const channel = await Channel.findOne({
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
	req: Request & { userId: string },
	res: Response
) => {
	try {
		const { messageId } = req.params;
		const userId = req.userId;

		const message = await ChannelMessage.findOne({
			include: [
				{
					include: [
						{
							include: [
								{
									model: Membership,
									required: true,
									where: { userId },
								},
							],
							model: Server,
						},
					],
					model: Channel,
				},
				{
					as: "author",
					attributes: ["id"],
					model: User,
				},
			],
			where: { id: messageId },
		});

		if (!message) {
			return res
				.status(404)
				.json({ message: "Message not found or access denied" });
		}

		const isAuthor = message.userId === userId;
		const isServerAdmin =
			message.channel?.server?.memberships?.[0]?.roleId === ADMIN_ROLE_ID;

		if (!isAuthor && !isServerAdmin) {
			return res
				.status(403)
				.json({ message: "Unauthorized to delete this message" });
		}

		await message.destroy();

		return res
			.status(200)
			.json({ message: "Message deleted successfully" });
	} catch (err) {
		console.error("Error deleting message:", err);
		return res.status(500).json({ message: "Failed to delete message" });
	}
};
