const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./dataBase");
const auth = require("./auth");
const Product = require("./models/products");

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
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
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
