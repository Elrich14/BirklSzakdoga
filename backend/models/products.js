const { DataTypes } = require("sequelize");
const { sequelize } = require("../dataBase");

const Product = sequelize.define(
  "Product",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    imageUrl: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "Products",
    timestamps: true,
  }
);

module.exports = Product;
