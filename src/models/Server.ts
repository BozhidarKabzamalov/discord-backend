import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class Server extends Model {
	declare id: number;
	declare name: string;
}

Server.init(
	{
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
	},
	{
		modelName: "Server",
		sequelize: dbConnection,
	}
);

export default Server;
