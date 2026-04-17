const express = require("express");
const Product = require("./models/products");
const ProductVariant = require("./models/productVariant");

const router = express.Router();

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// GET /api/products/:id/stock
router.get("/:id/stock", async (req, res) => {
  try {
    const variants = await ProductVariant.findAll({
      where: { productId: req.params.id },
      attributes: ["gender", "size", "color", "stock"],
    });
    res.json(variants);
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ error: "Failed to fetch stock" });
  }
});

module.exports = router;
