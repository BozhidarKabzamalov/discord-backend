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

const voiceChannelParticipants = new Map();

io.on("connection", (socket) => {
	console.log(`[SOCKET] User connected: ${socket.id}`);

	// Text channel events
	socket.on("join_channel", async (channelId) => {
		await socket.join(`channel:${channelId}`);
		console.log(`User ${socket.id} joined channel room: ${channelId}`);
	});

	socket.on("leave_channel", async (channelId) => {
		await socket.leave(`channel:${channelId}`);
		console.log(`User ${socket.id} left channel room: ${channelId}`);
	});

	// Voice channel events
	socket.on(
		"join_voice_channel",
		async ({ channelId, hasVideo = false, userId, username }) => {
			console.log(
				`[VOICE] User ${username} (${socket.id}) attempting to join voice channel: ${channelId} with video: ${hasVideo}`
			);

			await socket.join(`voice:${channelId}`);

			// Add user to participants map
			if (!voiceChannelParticipants.has(channelId)) {
				voiceChannelParticipants.set(channelId, new Map());
			}
			voiceChannelParticipants.get(channelId).set(socket.id, {
				hasVideo,
				socketId: socket.id,
				userId,
				username,
			});

			// Get current participants (including the new user)
			const participants = Array.from(
				voiceChannelParticipants.get(channelId).values()
			);
			console.log(
				`[VOICE] Current participants in channel ${channelId}:`,
				participants
			);

			// Notify all users in the voice channel about the new participant
			socket.to(`voice:${channelId}`).emit("user_joined_voice", {
				hasVideo,
				socketId: socket.id,
				userId,
				username,
			});

			// Send current participants to the new user
			socket.emit("voice_channel_participants", participants);

			// Also broadcast updated participant list to all users in the channel
			io.to(`voice:${channelId}`).emit(
				"voice_channel_participants",
				participants
			);

			console.log(
				`[VOICE] User ${username} (${socket.id}) successfully joined voice channel: ${channelId}`
			);
		}
	);

	socket.on(
		"leave_voice_channel",
		async ({ channelId, userId, username }) => {
			console.log(
				`[VOICE] User ${username} (${socket.id}) leaving voice channel: ${channelId}`
			);

			await socket.leave(`voice:${channelId}`);

			// Remove user from participants map
			if (voiceChannelParticipants.has(channelId)) {
				voiceChannelParticipants.get(channelId).delete(socket.id);
				
				// Get updated participants list
				const participants = Array.from(
					voiceChannelParticipants.get(channelId).values()
				);
				
				console.log(
					`[VOICE] Updated participants after ${username} left:`,
					participants
				);

				// Broadcast updated participant list to all remaining users
				io.to(`voice:${channelId}`).emit(
					"voice_channel_participants",
					participants
				);

				// Also notify about the specific user leaving
				socket.to(`voice:${channelId}`).emit("user_left_voice", {
					socketId: socket.id,
					userId,
					username,
				});

				// Clean up empty channel
				if (voiceChannelParticipants.get(channelId).size === 0) {
					voiceChannelParticipants.delete(channelId);
					console.log(`[VOICE] Deleted empty voice channel: ${channelId}`);
				}
			}

			console.log(
				`[VOICE] User ${username} (${socket.id}) successfully left voice channel: ${channelId}`
			);
		}
	);

	// WebRTC signaling events
	socket.on("webrtc_offer", ({ channelId, offer, targetSocketId }) => {
		socket.to(targetSocketId).emit("webrtc_offer", {
			channelId,
			offer,
			senderSocketId: socket.id,
		});
	});

	socket.on("webrtc_answer", ({ answer, channelId, targetSocketId }) => {
		socket.to(targetSocketId).emit("webrtc_answer", {
			answer,
			channelId,
			senderSocketId: socket.id,
		});
	});

	socket.on(
		"webrtc_ice_candidate",
		({ candidate, channelId, targetSocketId }) => {
			socket.to(targetSocketId).emit("webrtc_ice_candidate", {
				candidate,
				channelId,
				senderSocketId: socket.id,
			});
		}
	);

	// Video state change event
	socket.on("video_state_changed", ({ channelId, hasVideo }) => {
		console.log(
			`[VOICE] User ${socket.id} changed video state to: ${hasVideo} in channel: ${channelId}`
		);

		// Update participant video state
		if (voiceChannelParticipants.has(channelId)) {
			const participant = voiceChannelParticipants
				.get(channelId)
				.get(socket.id);
			if (participant) {
				participant.hasVideo = hasVideo;

				// Broadcast updated participant list to all users in the channel
				const participants = Array.from(
					voiceChannelParticipants.get(channelId).values()
				);
				io.to(`voice:${channelId}`).emit(
					"voice_channel_participants",
					participants
				);

				// Also notify about the specific video state change
				socket
					.to(`voice:${channelId}`)
					.emit("user_video_state_changed", {
						hasVideo,
						socketId: socket.id,
					});
			}
		}
	});

	socket.on("disconnect", () => {
		console.log(`[SOCKET] User disconnected: ${socket.id}`);

		// Clean up voice channel participants
		for (const [
			channelId,
			participants,
		] of voiceChannelParticipants.entries()) {
			if (participants.has(socket.id)) {
				const user = participants.get(socket.id);
				participants.delete(socket.id);

				console.log(
					`[VOICE] User ${user.username} (${socket.id}) disconnected from voice channel: ${channelId}`
				);

				// Get updated participants list
				const updatedParticipants = Array.from(participants.values());

				// Broadcast updated participant list to all remaining users
				io.to(`voice:${channelId}`).emit(
					"voice_channel_participants",
					updatedParticipants
				);

				// Also notify about the specific user leaving
				socket.to(`voice:${channelId}`).emit("user_left_voice", {
					socketId: socket.id,
					userId: user.userId,
					username: user.username,
				});

				// Clean up empty channel
				if (participants.size === 0) {
					voiceChannelParticipants.delete(channelId);
					console.log(`[VOICE] Deleted empty voice channel after disconnect: ${channelId}`);
				}
			}
		}
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

//dbConnection.sync({ force: true });
