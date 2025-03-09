import { DataTypes } from "sequelize";

import dbConnection from "../utils/database";

const Message = dbConnection.define("Message", {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER,
	},
	message: {
		allowNull: false,
		type: DataTypes.STRING,
	},
});

export default Message;
