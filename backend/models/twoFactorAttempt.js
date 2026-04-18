const { DataTypes } = require("sequelize");
const { sequelize } = require("../dataBase");

const TwoFactorAttempt = sequelize.define(
  "TwoFactorAttempt",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    succeeded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        name: "two_factor_attempts_user_created_idx",
        fields: ["userId", "createdAt"],
      },
    ],
  }
);

module.exports = TwoFactorAttempt;
