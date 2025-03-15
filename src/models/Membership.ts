import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class Membership extends Model {
	declare roleId: number;
	declare serverId: number;
	declare userId: number;
}

Membership.init(
	{
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		roleId: {
			allowNull: false,
			references: { key: "id", model: "Roles" },
			type: DataTypes.INTEGER,
		},
		serverId: {
			allowNull: false,
			references: { key: "id", model: "Servers" },
			type: DataTypes.INTEGER,
		},
		userId: {
			allowNull: false,
			references: { key: "id", model: "Users" },
			type: DataTypes.INTEGER,
		},
	},
	{
		modelName: "Membership",
		sequelize: dbConnection,
	}
);

export default Membership;
