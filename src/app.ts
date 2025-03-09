import bodyParser from 'body-parser';
import express from "express";

import Message from "./models/Message";
import Room from "./models/Room";
import Server from "./models/Server";
import ServerUser from "./models/ServerUser";
import User from "./models/User";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(bodyParser.json());

app.use(userRoutes);

/*Server.hasMany(Room)
Room.belongsTo(Server)

Room.hasMany(Message)
Message.belongsTo(Room)

User.hasMany(Message)
Message.belongsTo(User)

User.belongsToMany(Server, { through: ServerUser })
Server.belongsToMany(User, { through: ServerUser })

let sequelize = require('./controllers/DatabaseController');
sequelize.sync().then(result => {

}).catch(error => {
    console.log(error);
})*/

app.listen(3000);