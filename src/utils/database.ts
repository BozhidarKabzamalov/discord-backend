import { Sequelize } from "sequelize";

const dbConnection = new Sequelize("discord", "myuser", "mypassword", {
    dialect: "mysql",
    host: "localhost",
    logging: false,
});

export default dbConnection;
