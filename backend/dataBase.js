const { Sequelize } = require("sequelize");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const dotenv = require("dotenv");
dotenv.config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_HOST?.includes("supabase")
        ? { require: true, rejectUnauthorized: false }
        : false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports.sequelize = sequelize;
