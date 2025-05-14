import { Request, Response } from "express";

import Channel from "../models/Channel";
import Server from "../models/Server";

interface createChannelRequestBodyType {
	name: string;
	type: "text" | "voice";
}

interface updateChannelRequestBodyType {
	name: string;
}

export const createChannel = async (
	req: Request<{ serverId: number }, null, createChannelRequestBodyType>,
	res: Response
) => {
	try {
		const { name, type } = req.body;
		const { serverId } = req.params;

		if (!name) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		if (!["text", "voice"].includes(type)) {
			return res.status(400).json({ error: "Invalid channel type" });
		}

		const server = await Server.findByPk(serverId);

		if (!server) {
			return res.status(404).json({ error: "Server not found" });
		}

		const channel = await Channel.create({
			name,
			serverId,
			type,
		});

		const createdChannel = await Channel.findByPk(channel.id);

		return res.status(201).json(createdChannel);
	} catch (error) {
		console.error("Error creating channel:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteChannel = async (req: Request, res: Response) => {
	try {
		const { channelId } = req.params;

		if (!channelId) {
			return res.status(400).json({ error: "Channel ID is required" });
		}

		const channel = await Channel.findByPk(channelId);

		if (!channel) {
			return res.status(404).json({ error: "Channel not found" });
		}

		await channel.destroy();

		return res.status(204);
	} catch (error) {
		console.error("Error deleting channel:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const updateChannel = async (
	req: Request<{ channelId: number }, null, updateChannelRequestBodyType>,
	res: Response
) => {
	try {
		const { channelId } = req.params;
		const { name } = req.body;

		if (!channelId) {
			return res.status(400).json({ error: "Channel ID is required" });
		}

		if (!name) {
			return res.status(400).json({ error: "No fields to update" });
		}

		const channel = await Channel.findByPk(channelId);

		if (!channel) {
			return res.status(404).json({ error: "Channel not found" });
		}

		const updateData: { name?: string; type?: "text" | "voice" } = {};
		if (name) updateData.name = name;

		await channel.update(updateData);

		const updatedChannel = await Channel.findByPk(channelId);

		return res.status(200).json(updatedChannel);
	} catch (error) {
		console.error("Error updating channel:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};
