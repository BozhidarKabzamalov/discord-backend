import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class Channel extends Model {
	declare id: number;
	declare name: string;
    declare type: "text" | "voice"
}

Channel.init(
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
		type: {
			allowNull: false,
			type: DataTypes.ENUM("text", "voice"),
		},
	},
	{
		modelName: "Channel",
		sequelize: dbConnection,
	}
);

export default Channel;
