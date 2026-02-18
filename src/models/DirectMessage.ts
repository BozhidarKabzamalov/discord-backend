import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class DirectMessage extends Model {
    declare content: string;
    declare createdAt: Date;
    declare id: number;
    declare receiverId: number;
    declare senderId: number;
    declare updatedAt: Date;
}

DirectMessage.init(
    {
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
        receiverId: {
            allowNull: false,
            references: { key: "id", model: "Users" },
            type: DataTypes.INTEGER,
        },
        senderId: {
            allowNull: false,
            references: { key: "id", model: "Users" },
            type: DataTypes.INTEGER,
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
    },
    {
        modelName: "DirectMessage",
        sequelize: dbConnection,
    },
);

export default DirectMessage;
