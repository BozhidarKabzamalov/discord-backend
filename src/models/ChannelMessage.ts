import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class ChannelMessage extends Model {
    declare channelId: number;
    declare content: string;
    declare id: number;
    declare userId: number;
}

ChannelMessage.init(
    {
        channelId: {
            allowNull: false,
            onDelete: "CASCADE",
            references: { key: "id", model: "Channels" },
            type: DataTypes.INTEGER,
        },
        content: {
            allowNull: false,
            type: DataTypes.TEXT,
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
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        userId: {
            allowNull: false,
            references: { key: "id", model: "Users" },
            type: DataTypes.INTEGER,
        },
    },
    {
        modelName: "ChannelMessage",
        sequelize: dbConnection,
    },
);

export default ChannelMessage;
