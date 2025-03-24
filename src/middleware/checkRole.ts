import { NextFunction, Request, Response } from "express";

import Membership from "../models/Membership";
import Role from "../models/Role";

const checkRole = (allowedRoles: string[]) => {
	return async (
		req: Request & { userId?: number },
		res: Response,
		next: NextFunction
	) => {
		try {
			const userId = req.userId;
			const serverId = req.params.serverId;

			if (!userId || !serverId) {
				return res.status(403).json({
					message: "Forbidden: Missing user or server ID",
				});
			}

			const membership = await Membership.findOne({
				include: { model: Role },
				where: { serverId, userId },
			});

			if (!membership || !allowedRoles.includes(membership.role.name)) {
				return res.status(403).json({
					message: "Forbidden: Insufficient permissions",
				});
			}

			next();
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};
};

export default checkRole;
