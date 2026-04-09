const express = require("express");
const { QueryTypes } = require("sequelize");
const { sequelize } = require("./dataBase");
const Product = require("./models/products");
const ProductVariant = require("./models/productVariant");
const Wishlist = require("./models/wishlist");
const authenticateToken = require("./authenticateToken");
const requireAdmin = require("./requireAdmin");
const { upload } = require("./upload");

/**
 * Syncs product variants: creates missing combinations, removes stale ones.
 * Preserves existing stock values for combinations that still apply.
 */
async function syncProductVariants(productId, genders, sizes, colors, transaction) {
  const existing = await ProductVariant.findAll({
    where: { productId },
    transaction,
  });

  const existingMap = new Map();
  for (const v of existing) {
    existingMap.set(`${v.gender}_${v.size}_${v.color}`, v);
  }

  const desiredKeys = new Set();
  for (const gender of genders) {
    for (const size of sizes) {
      for (const color of colors) {
        desiredKeys.add(`${gender}_${size}_${color}`);
      }
    }
  }

  // Create missing variants
  const toCreate = [];
  for (const key of desiredKeys) {
    if (!existingMap.has(key)) {
      const [gender, size, color] = key.split("_");
      toCreate.push({ productId, gender, size, color, stock: 0 });
    }
  }
  if (toCreate.length > 0) {
    await ProductVariant.bulkCreate(toCreate, { transaction });
  }

  // Remove variants that no longer match
  const toDelete = [];
  for (const [key, variant] of existingMap) {
    if (!desiredKeys.has(key)) {
      toDelete.push(variant.id);
    }
  }
  if (toDelete.length > 0) {
    await ProductVariant.destroy({
      where: { id: toDelete },
      transaction,
    });
  }
}

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
      const products = await Product.findAll({
        order: [["id", "ASC"]],
        include: [{ model: ProductVariant, as: "variants" }],
      });
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
          ? req.files.map((f) => f.path)
          : null;

      const transaction = await sequelize.transaction();
      try {
        const product = await Product.create(
          {
            name,
            description: description || null,
            price: parsedPrice,
            category: category || null,
            color: parsedColor,
            size: parsedSize,
            gender: parsedGender,
            imageUrls,
          },
          { transaction }
        );

        if (parsedGender.length > 0 && parsedSize.length > 0 && parsedColor.length > 0) {
          await syncProductVariants(
            product.id,
            parsedGender,
            parsedSize,
            parsedColor,
            transaction
          );
        }

        // Apply stock values if provided
        if (req.body.stockUpdates) {
          let stockUpdates;
          try {
            stockUpdates = JSON.parse(req.body.stockUpdates);
          } catch {
            stockUpdates = [];
          }
          for (const update of stockUpdates) {
            await ProductVariant.update(
              { stock: update.stock },
              {
                where: {
                  productId: product.id,
                  gender: update.gender,
                  size: update.size,
                  color: update.color,
                },
                transaction,
              }
            );
          }
        }

        await transaction.commit();

        const createdProduct = await Product.findByPk(product.id, {
          include: [{ model: ProductVariant, as: "variants" }],
        });
        res.status(201).json(createdProduct);
      } catch (innerError) {
        await transaction.rollback();
        throw innerError;
      }
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
          ? req.files.map((f) => f.path)
          : [];
      const mergedImageUrls = [...parsedExistingImageUrls, ...newImageUrls];
      updates.imageUrls =
        mergedImageUrls.length > 0 ? mergedImageUrls : product.imageUrls;

      const transaction = await sequelize.transaction();
      try {
        await product.update(updates, { transaction });

        // Sync variants with new size/color/gender combinations
        const finalGenders = updates.gender || product.gender || [];
        const finalSizes = updates.size || product.size || [];
        const finalColors = updates.color || product.color || [];

        if (finalGenders.length > 0 && finalSizes.length > 0 && finalColors.length > 0) {
          await syncProductVariants(
            product.id,
            finalGenders,
            finalSizes,
            finalColors,
            transaction
          );
        }

        // If stock data was sent in the request body, apply it
        if (req.body.stockUpdates) {
          let stockUpdates;
          try {
            stockUpdates = JSON.parse(req.body.stockUpdates);
          } catch {
            stockUpdates = [];
          }
          for (const update of stockUpdates) {
            await ProductVariant.update(
              { stock: update.stock },
              {
                where: {
                  productId: product.id,
                  gender: update.gender,
                  size: update.size,
                  color: update.color,
                },
                transaction,
              }
            );
          }
        }

        await transaction.commit();

        const updatedProduct = await Product.findByPk(product.id, {
          include: [{ model: ProductVariant, as: "variants" }],
        });
        res.json(updatedProduct);
      } catch (innerError) {
        await transaction.rollback();
        throw innerError;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);

// PUT /api/admin/products/:id/stock
router.put(
  "/products/:id/stock",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const { variants } = req.body;
      if (!Array.isArray(variants)) {
        return res.status(400).json({ error: "variants must be an array" });
      }

      const transaction = await sequelize.transaction();
      try {
        for (const v of variants) {
          await ProductVariant.update(
            { stock: v.stock },
            {
              where: {
                productId: product.id,
                gender: v.gender,
                size: v.size,
                color: v.color,
              },
              transaction,
            }
          );
        }
        await transaction.commit();

        const updated = await ProductVariant.findAll({
          where: { productId: product.id },
        });
        res.json(updated);
      } catch (innerError) {
        await transaction.rollback();
        throw innerError;
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ error: "Failed to update stock" });
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
      await ProductVariant.destroy({ where: { productId: product.id } });
      await product.destroy();

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);

module.exports = router;
