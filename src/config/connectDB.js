const { Sequelize } = require("sequelize");

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize("sso", "root", "password", {
  host: "localhost",
  dialect: "mysql",
  port: "3309",
  // logging: false
});

let connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// module.exports = connection;
export default connection;
