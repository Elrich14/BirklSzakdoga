const express = require("express");
const { QueryTypes } = require("sequelize");
const { sequelize } = require("./dataBase");
const Product = require("./models/products");
const Wishlist = require("./models/wishlist");
const authenticateToken = require("./authenticateToken");
const requireAdmin = require("./requireAdmin");
const upload = require("./upload");

const router = express.Router();

// GET /api/admin/orders/stats?range=day|week|month|year
router.get(
  "/orders/stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const range = req.query.range || "month";

      let dateFormat;
      let interval;
      switch (range) {
        case "day":
          dateFormat = "HH24:00";
          interval = "1 day";
          break;
        case "week":
          dateFormat = "YYYY-MM-DD";
          interval = "7 days";
          break;
        case "month":
          dateFormat = "YYYY-MM-DD";
          interval = "30 days";
          break;
        case "year":
          dateFormat = "YYYY-MM";
          interval = "365 days";
          break;
        default:
          return res.status(400).json({ error: "Invalid range" });
      }

      const stats = await sequelize.query(
        `SELECT
          to_char("createdAt", :dateFormat) AS label,
          COUNT(*)::integer AS "orderCount",
          COALESCE(SUM("totalPrice"), 0)::integer AS income
        FROM "Orders"
        WHERE "createdAt" >= NOW() - INTERVAL :interval
        GROUP BY label
        ORDER BY label ASC`,
        {
          replacements: { dateFormat, interval },
          type: QueryTypes.SELECT,
        }
      );

      res.json(stats);
    } catch (error) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({ error: "Failed to fetch order stats" });
    }
  }
);

// GET /api/admin/products/:id/stats?range=day|week|month|year
router.get(
  "/products/:id/stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const range = req.query.range || "month";

      let dateFormat;
      let interval;
      switch (range) {
        case "day":
          dateFormat = "HH24:00";
          interval = "1 day";
          break;
        case "week":
          dateFormat = "YYYY-MM-DD";
          interval = "7 days";
          break;
        case "month":
          dateFormat = "YYYY-MM-DD";
          interval = "30 days";
          break;
        case "year":
          dateFormat = "YYYY-MM";
          interval = "365 days";
          break;
        default:
          return res.status(400).json({ error: "Invalid range" });
      }

      const stats = await sequelize.query(
        `SELECT
          to_char(oi."createdAt", :dateFormat) AS label,
          COALESCE(SUM(oi.quantity), 0)::integer AS quantity,
          COALESCE(SUM(oi.quantity * oi."productPrice"), 0)::integer AS revenue
        FROM "OrderItems" oi
        WHERE oi."productId" = :productId
          AND oi."createdAt" >= NOW() - INTERVAL :interval
        GROUP BY label
        ORDER BY label ASC`,
        {
          replacements: {
            productId: parseInt(productId),
            dateFormat,
            interval,
          },
          type: QueryTypes.SELECT,
        }
      );

      res.json(stats);
    } catch (error) {
      console.error("Error fetching product stats:", error);
      res.status(500).json({ error: "Failed to fetch product stats" });
    }
  }
);

// GET /api/admin/dashboard
router.get(
  "/dashboard",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [result] = await sequelize.query(
        `SELECT
          COALESCE(SUM("totalPrice"), 0)::integer AS "totalRevenue",
          COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE)::integer AS "ordersToday",
          (SELECT COUNT(*)::integer FROM "Products") AS "totalProducts",
          COUNT(DISTINCT "userId") FILTER (WHERE "userId" IS NOT NULL)::integer AS "totalCustomers"
        FROM "Orders"`,
        { type: QueryTypes.SELECT }
      );

      res.json(result);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  }
);

// GET /api/admin/products
router.get(
  "/products",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const products = await Product.findAll({ order: [["id", "ASC"]] });
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
);

// POST /api/admin/products
router.post(
  "/products",
  authenticateToken,
  requireAdmin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { name, description, price, category, color, size, gender } =
        req.body;

      if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required" });
      }

      const parsedPrice = parseInt(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: "Price must be a positive number" });
      }

      let parsedColor = [];
      let parsedSize = [];
      let parsedGender = [];
      try {
        parsedColor = color ? JSON.parse(color) : [];
        parsedSize = size ? JSON.parse(size) : [];
        parsedGender = gender ? JSON.parse(gender) : [];
      } catch {
        return res.status(400).json({ error: "Invalid format for color, size, or gender" });
      }

      const imageUrls =
        req.files && req.files.length > 0
          ? req.files.map((f) => `/uploads/${f.filename}`)
          : null;

      const product = await Product.create({
        name,
        description: description || null,
        price: parsedPrice,
        category: category || null,
        color: parsedColor,
        size: parsedSize,
        gender: parsedGender,
        imageUrls,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

// PUT /api/admin/products/:id
router.put(
  "/products/:id",
  authenticateToken,
  requireAdmin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const { name, description, price, category, color, size, gender } =
        req.body;

      if (price) {
        const parsedPrice = parseInt(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
          return res.status(400).json({ error: "Price must be a positive number" });
        }
      }

      let parsedColor, parsedSize, parsedGender, parsedExistingImageUrls;
      try {
        parsedColor = color ? JSON.parse(color) : product.color;
        parsedSize = size ? JSON.parse(size) : product.size;
        parsedGender = gender ? JSON.parse(gender) : product.gender;
        parsedExistingImageUrls = req.body.existingImageUrls
          ? JSON.parse(req.body.existingImageUrls)
          : [];
      } catch {
        return res.status(400).json({ error: "Invalid format for color, size, gender, or image URLs" });
      }

      const updates = {
        name: name || product.name,
        description:
          description !== undefined ? description : product.description,
        price: price ? parseInt(price) : product.price,
        category: category !== undefined ? category : product.category,
        color: parsedColor,
        size: parsedSize,
        gender: parsedGender,
      };

      const newImageUrls =
        req.files && req.files.length > 0
          ? req.files.map((f) => `/uploads/${f.filename}`)
          : [];
      const mergedImageUrls = [...parsedExistingImageUrls, ...newImageUrls];
      updates.imageUrls =
        mergedImageUrls.length > 0 ? mergedImageUrls : product.imageUrls;

      await product.update(updates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);

// DELETE /api/admin/products/:id
router.delete(
  "/products/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      await Wishlist.destroy({ where: { productId: product.id } });
      await product.destroy();

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);

module.exports = router;
