import { DataTypes, Model } from "sequelize";

import dbConnection from "../utils/database";

class FriendRequest extends Model {
    declare createdAt: Date;
    declare id: number;
    declare receiverId: number;
    declare senderId: number;
    declare status: "accepted" | "pending" | "rejected";
    declare updatedAt: Date;
}

FriendRequest.init(
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
        status: {
            allowNull: false,
            defaultValue: "pending",
            type: DataTypes.ENUM("pending", "accepted", "rejected"),
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
    },
    {
        indexes: [
            {
                fields: ["senderId", "receiverId"],
                unique: true,
            },
        ],
        modelName: "FriendRequest",
        sequelize: dbConnection,
    },
);

export default FriendRequest;
