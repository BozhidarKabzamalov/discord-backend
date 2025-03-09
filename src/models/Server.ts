import { DataTypes } from "sequelize";

import dbConnection from "../utils/database";

const Server = dbConnection.define("Server", {
	endpoint: {
		allowNull: false,
		type: DataTypes.STRING(1400),
	},
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER,
	},
	name: {
		allowNull: false,
		type: DataTypes.STRING,
	},
	thumbnail: {
		allowNull: false,
		type: DataTypes.STRING(1400),
	},
	userId: {
		allowNull: false,
		type: DataTypes.INTEGER,
	},
});

/*Server.prototype.createSocketIoNamespace = function (rooms) {
	let io = require("../bin/www");
	let onlineUsers = [];

	io.of(this.endpoint).on("connection", (socket) => {
		socket.on("messageToServer", (message) => {
			let roomName = Object.keys(socket.rooms)[1];
			let room = rooms.find((room) => {
				return room.name == roomName;
			});

			io.of(this.endpoint).to(roomName).emit("messageToClient", message);
		});

		socket.on("userCameOnline", (username) => {
			socket.username = username;
			onlineUsers.push(socket.username);
			io.of(this.endpoint).emit("onlineUsers", onlineUsers);
		});

		socket.on("disconnect", () => {
			var index = onlineUsers.indexOf(socket.username);
			onlineUsers.splice(index, 1);
			io.of(this.endpoint).emit("onlineUsers", onlineUsers);
		});

		socket.on("joinRoom", async (roomToJoin) => {
			let roomToLeave = Object.keys(socket.rooms)[1];

			let room = await Room.findAll({
				where: {
					name: roomToJoin.roomName,
					serverId: roomToJoin.serverId,
				},
				include: {
					model: Message,
					include: {
						model: User,
						attributes: { exclude: ["password"] },
					},
				},
			});

			socket.leave(roomToLeave);
			socket.join(roomToJoin.roomName);

			socket.emit("chatHistory", room[0].messages);
		});
	});
};*/

export default Server;
