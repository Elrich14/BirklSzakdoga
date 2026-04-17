const User = require("./user");
const Product = require("./products");
const Wishlist = require("./wishlist");
const Order = require("./order");
const OrderItem = require("./orderItem");
const ProductVariant = require("./productVariant");
const Review = require("./review");

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(ProductVariant, { foreignKey: "productId", as: "variants" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

Review.belongsTo(User, { foreignKey: "userId", as: "user" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });

module.exports = {
  Product,
  User,
  Wishlist,
  Order,
  OrderItem,
  ProductVariant,
  Review,
};
