const { DataTypes } = require("sequelize");
const { sequelize } = require("../dataBase");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
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
    color: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    size: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
  },
  {
    tableName: "Products",
    timestamps: true,
  }
);

module.exports = Product;
