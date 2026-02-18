import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import Category from "./models/Category";
import Channel from "./models/Channel";
import ChannelMessage from "./models/ChannelMessage";
import DirectMessage from "./models/DirectMessage";
import FriendRequest from "./models/FriendRequest";
import Friendship from "./models/Friendship";
import Invite from "./models/Invite";
import Membership from "./models/Membership";
import Role from "./models/Role";
import Server from "./models/Server";
import User from "./models/User";
import categoryRoutes from "./routes/categoryRoutes";
import channelMessageRoutes from "./routes/channelMessageRoutes";
import channelRoutes from "./routes/channelRoutes";
import directMessageRoutes from "./routes/directMessageRoutes";
import friendRequestRoutes from "./routes/friendRequestRoutes";
import membershipRoutes from "./routes/membershipRoutes";
import serverRoutes from "./routes/serverRoutes";
import userRoutes from "./routes/userRoutes";
import { createAssociations } from "./utils/associations";
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

// Create associations
// createAssociations();

app.use(userRoutes);
app.use(serverRoutes);
app.use(channelMessageRoutes);
app.use(channelRoutes);
app.use(categoryRoutes);
app.use(membershipRoutes);
app.use(friendRequestRoutes);
app.use(directMessageRoutes);

server.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});

io.on("connection", (socket) => {
    socket.on("join_channel", async (channelId) => {
        await socket.join(`channel:${channelId}`);
    });

    socket.on("leave_channel", async (channelId) => {
        await socket.leave(`channel:${channelId}`);
    });

    socket.on("join_dm", async (userId) => {
        await socket.join(`dm:${userId}`);
    });

    socket.on("leave_dm", async (userId) => {
        await socket.leave(`dm:${userId}`);
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

User.hasMany(FriendRequest, {
    as: "sentFriendRequests",
    foreignKey: "senderId",
});
User.hasMany(FriendRequest, {
    as: "receivedFriendRequests",
    foreignKey: "receiverId",
});
FriendRequest.belongsTo(User, { as: "sender", foreignKey: "senderId" });
FriendRequest.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

User.belongsToMany(User, {
    as: "friends",
    foreignKey: "userId1",
    otherKey: "userId2",
    through: Friendship,
});

User.hasMany(DirectMessage, { as: "sentMessages", foreignKey: "senderId" });
User.hasMany(DirectMessage, {
    as: "receivedMessages",
    foreignKey: "receiverId",
});
DirectMessage.belongsTo(User, { as: "sender", foreignKey: "senderId" });
DirectMessage.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

//dbConnection.sync({ force: true });
