import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

import Channel from "./models/Channel";
import ChannelMessage from "./models/ChannelMessage";
import Membership from "./models/Membership";
import Role from "./models/Role";
import Server from "./models/Server";
import User from "./models/User";
import serverRoutes from "./routes/serverRoutes";
import userRoutes from "./routes/userRoutes";
import dbConnection from "./utils/database";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(userRoutes);
app.use(serverRoutes);

app.listen(3000);

Server.hasMany(Channel, { foreignKey: "serverId" });
Channel.belongsTo(Server, { foreignKey: "serverId" });

User.belongsToMany(Server, {
    foreignKey: "userId",
    through: Membership,
});
Server.belongsToMany(User, { foreignKey: "userId", through: Membership });

User.hasMany(Membership, { foreignKey: "userId" });
Membership.belongsTo(User, { foreignKey: "userId" });

Server.hasMany(Membership, { foreignKey: "serverId" });
Membership.belongsTo(Server, { foreignKey: "serverId" });

Role.hasMany(Membership, { foreignKey: "roleId" });
Membership.belongsTo(Role, { foreignKey: "roleId" });

Channel.hasMany(ChannelMessage, { foreignKey: 'channelId' })
ChannelMessage.belongsTo(Channel, { foreignKey: "channelId" });

//dbConnection.sync({ force: true });