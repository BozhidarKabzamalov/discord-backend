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
	},
	{
		modelName: "User",
		sequelize: dbConnection,
	}
);

export default User;
