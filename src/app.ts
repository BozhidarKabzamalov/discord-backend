import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

import Channel from "./models/Channel";
import ChannelMessage from "./models/ChannelMessage";
import Membership from "./models/Membership";
import Role from "./models/Role";
import Server from "./models/Server";
import User from "./models/User";
import channelMessageRoutes from "./routes/channelMessageRoutes";
import serverRoutes from "./routes/serverRoutes";
import userRoutes from "./routes/userRoutes";
import dbConnection from "./utils/database";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(userRoutes);
app.use(serverRoutes);
app.use(channelMessageRoutes);

app.listen(3000);

Server.hasMany(Channel, { as: 'channels', foreignKey: "serverId" });
Channel.belongsTo(Server, { as: 'server', foreignKey: "serverId" });

User.belongsToMany(Server, {
    foreignKey: "userId",
    through: Membership,
});
Server.belongsToMany(User, { foreignKey: "userId", through: Membership });

User.hasMany(Membership, { as: "memberships", foreignKey: "userId" });
Membership.belongsTo(User, { as: "user", foreignKey: "userId" });

Server.hasMany(Membership, { as: "memberships", foreignKey: "serverId" });
Membership.belongsTo(Server, { as: "server", foreignKey: "serverId" });

Role.hasMany(Membership, { foreignKey: "roleId" });
Membership.belongsTo(Role, { foreignKey: "roleId" });

Channel.hasMany(ChannelMessage, { foreignKey: 'channelId' })
ChannelMessage.belongsTo(Channel, { foreignKey: "channelId" });

User.hasMany(ChannelMessage, { foreignKey: "userId" });
ChannelMessage.belongsTo(User, { as: "user", foreignKey: "userId" });

//dbConnection.sync({ force: true });