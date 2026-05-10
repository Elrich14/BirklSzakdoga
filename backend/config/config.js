require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const useSsl = process.env.DB_HOST?.includes("supabase");

const base = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "appdb",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  dialect: "postgres",
  logging: false,
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME_TEST || "appdb_test" },
  production: base,
};
