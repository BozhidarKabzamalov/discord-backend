import type { Request, Response } from "express";

import { Op } from "sequelize";

import Membership from "../models/Membership";
import Role from "../models/Role";

interface MemberActionParams {
    serverId: string;
    userId: string;
}

type RoleName = "admin" | "member" | "owner";

const getMembershipsAndRoles = async (
    requesterId: number,
    targetUserId: number,
    serverId: number,
) => {
    const roles = await Role.findAll({
        where: { name: { [Op.in]: ["owner", "admin", "member"] } },
    });

    const roleMap = roles.reduce(
        (acc, role) => {
            acc[role.name] = role;
            return acc;
        },
        {} as Record<RoleName, Role>,
    );

    if (!roleMap.admin || !roleMap.member) {
        throw new Error(
            "Core roles (admin, member) not found in the database.",
        );
    }

    const memberships = await Membership.findAll({
        include: {
            as: "Role",
            attributes: ["name"],
            model: Role,
        },
        where: {
            serverId,
            userId: { [Op.in]: [requesterId, targetUserId] },
        },
    });

    const requesterMembership = memberships.find(
        (m) => m.userId === requesterId,
    );
    const targetMembership = memberships.find((m) => m.userId === targetUserId);

    return { requesterMembership, roleMap, targetMembership };
};

export const promoteMember = async (
    req: Request<MemberActionParams>,
    res: Response,
) => {
    try {
        const { serverId, userId: targetUserIdStr } = req.params;
        const userId = req.userId;
        const targetUserId = parseInt(targetUserIdStr, 10);

        if (userId === targetUserId) {
            return res
                .status(400)
                .json({ message: "You cannot change your own role." });
        }

        const { requesterMembership, roleMap, targetMembership } =
            await getMembershipsAndRoles(
                userId,
                targetUserId,
                parseInt(serverId, 10),
            );

        if (!requesterMembership || !targetMembership) {
            return res.status(404).json({
                message: "User or target is not a member of this server.",
            });
        }

        const requesterRole = requesterMembership.Role!.name;
        const targetRole = targetMembership.Role!.name;

        if (requesterRole !== "owner" && requesterRole !== "admin") {
            return res.status(403).json({
                message:
                    "Forbidden: You do not have permission to promote members.",
            });
        }

        if (targetRole !== "member") {
            return res.status(400).json({
                message: `Cannot promote user. They are already an '${targetRole}'.`,
            });
        }

        await targetMembership.update({ roleId: roleMap.admin.id });

        return res.status(200).json({
            membership: targetMembership,
            message: "User promoted to admin successfully.",
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Server error while promoting member." });
    }
};

export const demoteAdmin = async (
    req: Request<MemberActionParams>,
    res: Response,
) => {
    try {
        const { serverId, userId: targetUserIdStr } = req.params;
        const userId = req.userId;
        const targetUserId = parseInt(targetUserIdStr, 10);

        if (userId === targetUserId) {
            return res
                .status(400)
                .json({ message: "You cannot change your own role." });
        }

        const { requesterMembership, roleMap, targetMembership } =
            await getMembershipsAndRoles(
                userId,
                targetUserId,
                parseInt(serverId, 10),
            );

        if (!requesterMembership || !targetMembership) {
            return res.status(404).json({
                message: "User or target is not a member of this server.",
            });
        }

        const requesterRole = requesterMembership.Role!.name;
        const targetRole = targetMembership.Role!.name;

        if (requesterRole !== "owner" && requesterRole !== "admin") {
            return res.status(403).json({
                message:
                    "Forbidden: You do not have permission to demote admins.",
            });
        }

        if (targetRole === "owner") {
            return res
                .status(400)
                .json({ message: "Cannot demote the server owner." });
        }

        if (targetRole !== "admin") {
            return res.status(400).json({
                message: `Cannot demote user. They are not an 'admin'.`,
            });
        }

        await targetMembership.update({ roleId: roleMap.member.id });

        return res.status(200).json({
            membership: targetMembership,
            message: "Admin demoted to member successfully.",
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Server error while demoting admin." });
    }
};

export const kickMember = async (
    req: Request<MemberActionParams>,
    res: Response,
) => {
    try {
        const { serverId, userId: targetUserIdStr } = req.params;
        const userId = req.userId;
        const targetUserId = parseInt(targetUserIdStr, 10);
        const serverIdNum = parseInt(serverId, 10);

        if (userId === targetUserId) {
            return res
                .status(400)
                .json({ message: "You cannot kick yourself from the server." });
        }

        const { requesterMembership, targetMembership } =
            await getMembershipsAndRoles(userId, targetUserId, serverIdNum);

        if (!requesterMembership || !targetMembership) {
            return res.status(404).json({
                message: "User or target is not a member of this server.",
            });
        }

        const requesterRole = requesterMembership.Role!.name;
        const targetRole = targetMembership.Role!.name;

        if (requesterRole === "member") {
            return res.status(403).json({
                message:
                    "Forbidden: You do not have permission to kick members.",
            });
        }

        if (targetRole === "owner") {
            return res
                .status(400)
                .json({ message: "The server owner cannot be kicked." });
        }

        if (requesterRole === "admin" && targetRole === "admin") {
            return res.status(403).json({
                message: "Forbidden: Admins cannot kick other admins.",
            });
        }

        await targetMembership.destroy();

        return res
            .status(200)
            .json({ message: "User kicked from the server successfully." });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Server error while kicking member." });
    }
};
