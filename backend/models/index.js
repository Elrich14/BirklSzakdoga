const User = require("./user");
const Product = require("./products");
const Wishlist = require("./wishlist");
const Order = require("./order");
const OrderItem = require("./orderItem");
const ProductVariant = require("./productVariant");

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(ProductVariant, { foreignKey: "productId", as: "variants" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

module.exports = {
  Product,
  User,
  Wishlist,
  Order,
  OrderItem,
  ProductVariant,
};
