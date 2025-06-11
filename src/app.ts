import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import Category from "./models/Category";
import Channel from "./models/Channel";
import ChannelMessage from "./models/ChannelMessage";
import Invite from "./models/Invite";
import Membership from "./models/Membership";
import Role from "./models/Role";
import Server from "./models/Server";
import User from "./models/User";
import categoryRoutes from "./routes/categoryRoutes";
import channelMessageRoutes from "./routes/channelMessageRoutes";
import channelRoutes from "./routes/channelRoutes";
import serverRoutes from "./routes/serverRoutes";
import userRoutes from "./routes/userRoutes";
import dbConnection from "./utils/database";

const app = express();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		methods: ["GET", "POST"],
		origin: "http://localhost:5173",
	},
});

app.use((req, res, next) => {
	req.io = io;
	next();
});

app.use(bodyParser.json());
app.use(cors());

app.use(userRoutes);
app.use(serverRoutes);
app.use(channelMessageRoutes);
app.use(channelRoutes);
app.use(categoryRoutes);

server.listen(3000, () => {
	console.log(`Server is running on port 3000`);
});

io.on("connection", (socket) => {
	console.log(`User connected: ${socket.id}`);

	// Join a room corresponding to a channel
	socket.on("join_channel", async (channelId) => {
		await socket.join(`channel:${channelId}`);
		console.log(`User ${socket.id} joined channel room: ${channelId}`);
	});

	// Leave a room
	socket.on("leave_channel", async (channelId) => {
		await socket.leave(`channel:${channelId}`);
		console.log(`User ${socket.id} left channel room: ${channelId}`);
	});

	socket.on("disconnect", () => {
		console.log(`User disconnected: ${socket.id}`);
	});
});

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

User.belongsToMany(Server, {
	as: "servers",
	foreignKey: "userId",
	otherKey: "serverId",
	through: Membership,
});

Server.belongsToMany(User, {
	as: "members",
	foreignKey: "serverId",
	otherKey: "userId",
	through: Membership,
});

User.hasMany(Membership, { as: "memberships", foreignKey: "userId" });
Membership.belongsTo(User, { as: "user", foreignKey: "userId" });

Server.hasMany(Membership, { as: "memberships", foreignKey: "serverId" });
Membership.belongsTo(Server, { as: "server", foreignKey: "serverId" });

Role.hasMany(Membership, { foreignKey: "roleId" });
Membership.belongsTo(Role, { foreignKey: "roleId" });

Channel.hasMany(ChannelMessage, { foreignKey: "channelId" });
ChannelMessage.belongsTo(Channel, { foreignKey: "channelId" });

User.hasMany(ChannelMessage, { foreignKey: "userId" });
ChannelMessage.belongsTo(User, { as: "user", foreignKey: "userId" });

Server.hasMany(Invite, { as: "invites", foreignKey: "serverId" });
Invite.belongsTo(Server, { as: "server", foreignKey: "serverId" });

//dbConnection.sync({ force: true });
