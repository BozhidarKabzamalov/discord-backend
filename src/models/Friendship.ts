import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class Friendship extends Model {
	declare createdAt: Date;
	declare id: number;
	declare userId1: number;
	declare userId2: number;
}

Friendship.init(
	{
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
		updatedAt: {
			allowNull: false,
			type: DataTypes.DATE,
		},
		userId1: {
			allowNull: false,
			references: { key: "id", model: "Users" },
			type: DataTypes.INTEGER,
		},
		userId2: {
			allowNull: false,
			references: { key: "id", model: "Users" },
			type: DataTypes.INTEGER,
		},
	},
	{
		indexes: [
			{
				fields: ["userId1", "userId2"],
				unique: true,
			},
		],
		modelName: "Friendship",
		sequelize: dbConnection,
	}
);

export default Friendship;
