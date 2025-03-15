import { Request, Response } from "express";

import Membership from "../models/Membership";
import Role from "../models/Role";
import Server from "../models/Server";

interface createServerRequestBodyType {
    name: string;
}

export const createServer = async (
	req: Request<null, null, createServerRequestBodyType>,
	res: Response
) => {
	try {
		const { name } = req.body;
        const ownerId = req.user.id;

		if (!name) {
			res.status(400).json({ message: "Server name is required" });
            return;
		}

		if (!ownerId) {
			res.status(401).json({ message: "Unauthorized" });
            return;
		}

		const newServer = await Server.create({ name, ownerId });

		const adminRole = await Role.findOne({ where: { name: "admin" } });

		if (!adminRole) {
			res.status(500).json({
				message: "Admin role not found. Please seed roles first.",
			});
            return;
		}

		await Membership.create({
			roleId: adminRole.id,
			serverId: newServer.id,
			userId: ownerId,
		});

		res.status(201).json({
			message: "Server created successfully",
			server: newServer,
		});
	} catch (error) {
        console.log(error)
		res.status(500).json({ message: "Internal server error" });
	}
};
