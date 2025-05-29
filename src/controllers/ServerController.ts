import { Request, Response } from "express";

import Channel from "../models/Channel";
import Invite from "../models/Invite";
import Membership from "../models/Membership";
import Role from "../models/Role";
import Server from "../models/Server";
import User from "../models/User";
import generateInviteCode from "../utils/generateInviteCode";

interface createUpdateServerRequestBodyType {
	name: string;
}

export const getServersForUser = async (
	req: Request & {
		userId: string;
	},
	res: Response
) => {
	try {
		const userId = req.userId;

		const memberships = await Membership.findAll({
			include: [
				{
					as: "server",
					include: [
						{
							as: "channels",
							model: Channel,
						},
						{
							as: "memberships",
							attributes: ["roleId"],
							include: [
								{
									as: "user",
									attributes: ["id", "username"],
									model: User,
								},
							],
							model: Membership,
						},
					],
					model: Server,
				},
			],
			where: { userId },
		});

		const servers = memberships.map((membership) => {
			const server = membership.server.toJSON();

			server.members = server.memberships.map((m) => ({
				id: m.user.id,
				roleId: m.roleId,
				username: m.user.username,
			}));

			delete server.memberships;

			return server;
		});

		return res.status(200).json({ servers });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const createServer = async (
	req: Request<null, null, createUpdateServerRequestBodyType> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { name } = req.body;
		const ownerId = req.userId;

		if (!name) {
			return res.status(400).json({ message: "Server name is required" });
		}

		const newServer = await Server.create({ name, ownerId });

		await Channel.bulkCreate([
			{ name: "general", serverId: newServer.id, type: "text" },
			{ name: "general", serverId: newServer.id, type: "voice" },
		]);

		const ownerRole = await Role.findOne({ where: { name: "owner" } });

		if (!ownerRole) {
			return res.status(500).json({
				message: "Admin role not found. Please seed roles first.",
			});
		}

		await Membership.create({
			roleId: ownerRole.id,
			serverId: newServer.id,
			userId: ownerId,
		});

        const uniqueInviteCode = generateInviteCode(8);

        await Invite.create(
			{
				code: uniqueInviteCode,
				serverId: newServer.id,
			}
		);

		const server = await Server.findByPk(newServer.id, {
			include: [
				{
					as: "channels",
					model: Channel,
				},
				{
					as: "memberships",
					attributes: ["roleId"],
					include: [
						{
							as: "user",
							attributes: ["id", "username"],
							model: User,
						},
					],
					model: Membership,
				},
			],
		});

		const mappedServer = server!.toJSON();

		mappedServer.members = mappedServer.memberships.map((m) => ({
			id: m.user.id,
			roleId: m.roleId,
			username: m.user.username,
		}));

		delete mappedServer.memberships;

		return res.status(201).json({
			message: "Server created successfully",
			server: mappedServer,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const joinServer = async (
	req: Request<{ inviteCode: number }> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { inviteCode } = req.params;
		const userId = req.userId;

		if (!inviteCode) {
			return res.status(400).json({
				message: "Invite code is required",
			});
		}

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const user = await User.findByPk(userId);

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

        const invite = await Invite.findOne({
			where: { code: inviteCode }
		});

		if (!invite) {
			return res.status(404).json({ message: "Invite code not found" });
		}

		const memberRole = await Role.findOne({
			where: { name: "member" },
		});

		if (!memberRole) {
			return res.status(500).json({
				message: "Admin role not found. Please seed roles first.",
			});
		}

		const existingMembership = await Membership.findOne({
			where: { serverId: invite.serverId, userId },
		});

		if (existingMembership) {
			return res.status(400).json({
				message: "User is already a member of this server",
			});
		}

		await Membership.create({
			roleId: memberRole.id,
			serverId: invite.serverId,
			userId,
		});

        const server = await Server.findByPk(invite.serverId, {
			include: [
				{
					as: "channels",
					model: Channel,
				},
				{
					as: "memberships",
					attributes: ["roleId"],
					include: [
						{
							as: "user",
							attributes: ["id", "username"],
							model: User,
						},
					],
					model: Membership,
				},
			],
		});

		const mappedServer = server!.toJSON();

		mappedServer.members = mappedServer.memberships.map((m) => ({
			id: m.user.id,
			roleId: m.roleId,
			username: m.user.username,
		}));

		delete mappedServer.memberships;

		return res.status(201).json({
			message: "Server created successfully",
			server: mappedServer,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const leaveServer = async (
	req: Request<{ serverId: number }> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { serverId } = req.params;
		const userId = req.userId;

		const membership = await Membership.findOne({
			where: { serverId, userId },
		});

		if (!membership) {
			return res.status(404).json({
				message: "User is not a member of this server",
			});
		}

		await membership.destroy();

		return res.status(200).json({ message: "User has left the server" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteServer = async (
	req: Request<{ serverId: number }> & {
		userId: string;
	},
	res: Response
) => {
	const { serverId } = req.params;

	try {
		const server = await Server.findByPk(serverId);

		if (!server) {
			return res.status(404).json({ message: "Server not found" });
		}

		await Membership.destroy({ where: { serverId } });

		await server.destroy();

		return res.status(200).json({ message: "Server has been deleted" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const updateServer = async (
	req: Request<
		{ serverId: number },
		null,
		createUpdateServerRequestBodyType
	> & {
		userId: string;
	},
	res: Response
) => {
	try {
		const { serverId } = req.params;
		const { name } = req.body;

		if (!name) {
			return res.status(400).json({
				message: "Server name is required",
			});
		}

		const server = await Server.findByPk(serverId);

		if (!server) {
			return res.status(404).json({ message: "Server not found" });
		}

		await server.update({ name });

		return res.status(200).json({ server });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};
