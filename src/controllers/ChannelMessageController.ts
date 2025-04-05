import { Request, Response } from "express";

import Channel from "../models/Channel";
import ChannelMessage from "../models/ChannelMessage";

export const createChannelMessage = async (
	req: Request<{ channelId: number }, null, { content: string }> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { channelId } = req.params;
		const { content } = req.body;
		const userId = req.userId;

		if (!content) {
			return res
				.status(400)
				.json({ message: "Message content is required" });
		}

		const channel = await Channel.findByPk(channelId);

		if (!channel) {
			return res.status(404).json({ message: "Channel not found" });
		}

		const channelMessage = await ChannelMessage.create({
			channelId,
			content,
			userId,
		});

		return res.status(201).json({ channelMessage });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const getChannelMessages = async () => {};

export const deleteChannelMessage = async () => {};

export const updateChannelMessage = async () => {};
