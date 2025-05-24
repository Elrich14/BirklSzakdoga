const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./dataBase");
const auth = require("./auth");
const Product = require("./models/products");
const orderEmail = require("./orderEmail");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use("/auth", auth);

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

const authenticateToken = require("./authenticateToken");

app.get("/api/admin/orders", authenticateToken, (req, res) => {
  if (req.user.role === "admin") {
    res.json({ message: "Welcome, admin!" });
  } else {
    res.status(403).json({ error: "Access denied" });
  }
});

const Wishlist = require("./models/wishlist");

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
    const item = await Wishlist.create({ ...req.body, userId });
    res.status(201).json(item);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
});

app.post("/api/orderEmail", async (req, res) => {
  try {
    await orderEmail(req.body);
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.get("*", (req, res) => {
  res.status(404).json({ error: "Invalid endpoint" });
});

app.listen(PORT, async () => {
  try {
    require("./models");
    await sequelize.authenticate();
    await sequelize.sync({
      force: false, // adatbázis újra generálása
    });

    console.log(
      "Connection to the database has been established successfully."
    );
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
