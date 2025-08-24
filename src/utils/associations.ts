import Category from "../models/Category";
import Room from "../models/Channel";
import Channel from "../models/Channel";
import ChannelMessage from "../models/ChannelMessage";
import DirectMessage from "../models/DirectMessage";
import FriendRequest from "../models/FriendRequest";
import Friendship from "../models/Friendship";
import Invite from "../models/Invite";
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

	Server.belongsToMany(User, {
		as: "members",
		foreignKey: "serverId",
		otherKey: "userId",
		through: Membership,
	});

	Role.hasMany(Membership, { as: "memberships", foreignKey: "roleId" });

	Membership.belongsTo(User, { as: "user", foreignKey: "userId" });
	Membership.belongsTo(Server, { as: "server", foreignKey: "serverId" });
	Membership.belongsTo(Role, { as: "role", foreignKey: "roleId" });

    Server.hasMany(Channel, { foreignKey: "serverId", onDelete: "CASCADE" });
	Channel.belongsTo(Server, { foreignKey: "serverId" });

	Server.hasMany(Category, {
		as: "categories",
		foreignKey: "serverId",
		onDelete: "CASCADE",
	});
	Category.belongsTo(Server, {
		as: "server",
		foreignKey: "serverId",
	});

	Category.hasMany(Channel, {
		as: "channels",
		foreignKey: "categoryId",
		onDelete: "CASCADE",
	});
	Channel.belongsTo(Category, {
		as: "category",
		foreignKey: "categoryId",
	});

	Channel.hasMany(ChannelMessage, { foreignKey: "channelId" });
	ChannelMessage.belongsTo(Channel, { foreignKey: "channelId" });

	User.hasMany(ChannelMessage, { foreignKey: "userId" });
	ChannelMessage.belongsTo(User, { as: "user", foreignKey: "userId" });

	Server.hasMany(Invite, { as: "invites", foreignKey: "serverId" });
	Invite.belongsTo(Server, { as: "server", foreignKey: "serverId" });

	User.hasMany(FriendRequest, { as: "sentFriendRequests", foreignKey: "senderId" });
	User.hasMany(FriendRequest, { as: "receivedFriendRequests", foreignKey: "receiverId" });
	FriendRequest.belongsTo(User, { as: "sender", foreignKey: "senderId" });
	FriendRequest.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

	User.belongsToMany(User, {
		as: "friends",
		foreignKey: "userId1",
		otherKey: "userId2",
		through: Friendship,
	});

	User.hasMany(DirectMessage, { as: "sentMessages", foreignKey: "senderId" });
	User.hasMany(DirectMessage, { as: "receivedMessages", foreignKey: "receiverId" });
	DirectMessage.belongsTo(User, { as: "sender", foreignKey: "senderId" });
	DirectMessage.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
}

export const synchronizeModels = async () => {
    await dbConnection.sync({ force: true });
}
