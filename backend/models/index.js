const User = require("./user");
const Product = require("./products");
const Wishlist = require("./wishlist");
const Order = require("./order");
const OrderItem = require("./orderItem");

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

module.exports = {
  Product,
  User,
  Wishlist,
  Order,
  OrderItem,
};
