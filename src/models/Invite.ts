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
	},
	{
		modelName: "Invite",
		sequelize: dbConnection,
	}
);

export default Invite;
