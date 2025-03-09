import { DataTypes } from "sequelize";

import dbConnection from "../utils/database";

const ServerUser = dbConnection.define("server_user", {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER,
	},
});

export default ServerUser;
