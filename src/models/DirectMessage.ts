import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class DirectMessage extends Model {
	declare content: string;
	declare id: number;
	declare receiverId: number;
	declare senderId: number;
}

DirectMessage.init(
	{
		content: {
			allowNull: false,
			type: DataTypes.TEXT,
		},
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		receiverId: {
			allowNull: false,
			references: { key: "id", model: "Users" },
			type: DataTypes.INTEGER,
		},
		senderId: {
			allowNull: false,
			references: { key: "id", model: "Users" },
			type: DataTypes.INTEGER,
		},
	},
	{
		modelName: "DirectMessage",
		sequelize: dbConnection,
	}
);

export default DirectMessage;
