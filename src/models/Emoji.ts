import { DataTypes } from "sequelize";

import dbConnection from "../utils/database";

const Emoji = dbConnection.define("Emoji", {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.INTEGER,
	},
	image: {
		allowNull: false,
		type: DataTypes.STRING(1400),
	},
	keyword: {
		allowNull: false,
		type: DataTypes.STRING,
	},
});

export default Emoji;
