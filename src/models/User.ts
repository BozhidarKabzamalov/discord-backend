import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class User extends Model {
	declare email: string;
	declare id: number;
	declare password: string;
	declare username: string;
}

User.init(
	{
		createdAt: {
			allowNull: false,
			type: DataTypes.DATE,
		},
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
		updatedAt: {
			allowNull: false,
			type: DataTypes.DATE,
		},
		username: {
			allowNull: false,
			type: DataTypes.STRING,
		},
	},
	{
		modelName: "User",
		sequelize: dbConnection,
	}
);

export default User;
