const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { sequelize } = require("./dataBase");
const auth = require("./auth");
const { Order, OrderItem } = require("./models");
const Product = require("./models/products");
const Wishlist = require("./models/wishlist");
const authenticateToken = require("./authenticateToken");
const orderEmail = require("./orderEmail");
const adminRoutes = require("./adminRoutes");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use("/auth", auth);
app.use("/api/admin", adminRoutes);

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.get("/api/wishlist", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Wishlist.findAll({ where: { userId } });
    res.json(items);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

app.delete(
  "/api/wishlist/product/:productId",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      const deleted = await Wishlist.destroy({ where: { productId, userId } });
      if (deleted === 0) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting wishlist item by productId:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  }
);

app.delete("/api/wishlist/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const deleted = await Wishlist.destroy({ where: { id, userId } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.post("/api/wishlist", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, productName, imageUrl, description, color, size, gender, quantity, price } = req.body;
    const item = await Wishlist.create({
      userId,
      productId,
      productName,
      imageUrl,
      description,
      color,
      size,
      gender,
      quantity,
      price,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
});

app.post("/api/orderEmail", async (req, res) => {
  try {
    const { name, email, shippingAddress, billingAddress, note, cartItems } =
      req.body;

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.productPrice * item.productQuantity,
      0
    );

    let userId = null;
    let username = null;
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        username = decoded.username || null;
      } catch {
        // Guest order — no userId
      }
    }

    const order = await Order.create({
      userId,
      customerName: name,
      customerEmail: email,
      shippingAddress,
      billingAddress: billingAddress || null,
      note: note || null,
      totalPrice,
      status: "pending",
    });

    await Promise.all(
      cartItems.map((item) =>
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.productQuantity,
          gender: item.gender || null,
          size: item.size || null,
          color: item.color || null,
        })
      )
    );

    await orderEmail({ ...req.body, username });
    res.json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large. Maximum size is 15MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
  next();
});

app.get("*", (req, res) => {
  res.status(404).json({ error: "Invalid endpoint" });
});

app.listen(PORT, async () => {
  try {
    require("./models");
    await sequelize.authenticate();
    await sequelize.sync({
      force: false,
    });

    console.log(
      "Connection to the database has been established successfully."
    );
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
