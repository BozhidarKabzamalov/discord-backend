import { DataTypes } from "sequelize";

import dbConnection from "../utils/database";

const User = dbConnection.define("User", {
	email: {
		allowNull: false,
		type: DataTypes.STRING,
	},
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER,
	},
	password: {
		allowNull: false,
		type: DataTypes.STRING,
	},
	username: {
		allowNull: false,
		type: DataTypes.STRING,
	},
});

export default User;
