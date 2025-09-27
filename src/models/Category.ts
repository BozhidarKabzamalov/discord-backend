import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class Category extends Model {
	declare id: number;
	declare name: string;
	declare serverId: number; // Foreign key to Server
}

Category.init(
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
		name: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		serverId: {
			allowNull: false,
			onDelete: "CASCADE",
			references: { key: "id", model: "Servers" },
			type: DataTypes.INTEGER,
		},
		updatedAt: {
			allowNull: false,
			type: DataTypes.DATE,
		},
	},
	{
		modelName: "Category",
		sequelize: dbConnection,
	}
);

export default Category;
