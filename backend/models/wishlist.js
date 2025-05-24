const { DataTypes } = require("sequelize");
const { sequelize } = require("../dataBase");

const Wishlist = sequelize.define(
  "Wishlist",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: DataTypes.STRING,
    description: DataTypes.STRING,
    color: DataTypes.STRING,
    size: DataTypes.STRING,
    gender: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
  },
  {
    timestamps: true,
  }
);

module.exports = Wishlist;
