import { NextFunction, Request, Response } from "express";

import Membership from "../models/Membership";
import Role from "../models/Role";

const checkRole = (allowedRoles: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.user?.id;
			const serverId = req.params.serverId;

			if (!userId || !serverId) {
				return res
					.status(403)
					.json({ message: "Forbidden: Missing user or server ID" });
			}

			// Get the user's role in this server
			const membership = await Membership.findOne({
				include: { as: "role", model: Role },
				where: { serverId, userId },
			});

			if (!membership || !allowedRoles.includes(membership.role.name)) {
				return res
					.status(403)
					.json({ message: "Forbidden: Insufficient permissions" });
			}

			next();
		} catch {
			return res.status(500).json({ message: "Internal server error" });
		}
	};
};

export default checkRole;
