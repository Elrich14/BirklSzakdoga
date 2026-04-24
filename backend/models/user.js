const { DataTypes } = require("sequelize");
const { sequelize } = require("../dataBase");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    authProvider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "local",
      validate: {
        isIn: [["local", "google"]],
      },
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
      validate: {
        isIn: [["user", "admin"]],
      },
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    twoFactorRecoveryCodes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = User;
