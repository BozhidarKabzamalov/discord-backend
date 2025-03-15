import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class Role extends Model {
	declare id: number;
	declare name: "admin" | "member" | "owner";
}

Role.init(
	{
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER,
		},
		name: {
			allowNull: false,
			type: DataTypes.ENUM("owner", "admin", "member"),
		},
	},
	{
		modelName: "Role",
		sequelize: dbConnection,
	}
);

export default Role;
