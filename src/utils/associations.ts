import Room from "../models/Channel";
import Channel from "../models/Channel";
import Membership from "../models/Membership";
import Role from "../models/Role";
import Server from "../models/Server";
import User from "../models/User";
import dbConnection from "./database";

export const createAssociations = () => {
    Server.hasMany(Room, { foreignKey: "serverId" });
	Room.belongsTo(Server, { foreignKey: "serverId" });

	Server.hasMany(Membership, { as: "memberships", foreignKey: "serverId" });

	User.belongsToMany(Server, {
		as: "servers",
		foreignKey: "userId",
		through: Membership,
	});

	Role.hasMany(Membership, { as: "memberships", foreignKey: "roleId" });

	Membership.belongsTo(User, { as: "user", foreignKey: "userId" });
	Membership.belongsTo(Server, { as: "server", foreignKey: "serverId" });
	Membership.belongsTo(Role, { as: "role", foreignKey: "roleId" });

    Server.hasMany(Channel, { foreignKey: "serverId", onDelete: "CASCADE" });
	Channel.belongsTo(Server, { foreignKey: "serverId" });
}

export const synchronizeModels = async () => {
    await dbConnection.sync({ force: true });
}
