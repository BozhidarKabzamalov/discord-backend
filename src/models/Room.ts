import { DataTypes } from "sequelize";

import dbConnection from "../utils/database";

const Room = dbConnection.define("Room", {
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
});

export default Room;
