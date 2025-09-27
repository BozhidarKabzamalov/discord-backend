import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class Invite extends Model {
	declare code: string;
	declare id: number;
	declare serverId: number;
}

Invite.init(
	{
		code: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true,
		},
		createdAt: {
			allowNull: false,
			type: DataTypes.DATE,
		},
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		serverId: {
			allowNull: false,
			references: { key: "id", model: "Servers" },
			type: DataTypes.INTEGER,
		},
		updatedAt: {
			allowNull: false,
			type: DataTypes.DATE,
		},
	},
	{
		modelName: "Invite",
		sequelize: dbConnection,
	}
);

export default Invite;
