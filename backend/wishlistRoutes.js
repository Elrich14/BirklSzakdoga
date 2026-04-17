const express = require("express");
const Wishlist = require("./models/wishlist");
const authenticateToken = require("./authenticateToken");

const router = express.Router();

// GET /api/wishlist
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Wishlist.findAll({ where: { userId } });
    res.json(items);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// DELETE /api/wishlist/product/:productId
router.delete(
  "/product/:productId",
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

// DELETE /api/wishlist/:id
router.delete("/:id", authenticateToken, async (req, res) => {
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

// POST /api/wishlist
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      productId,
      productName,
      imageUrl,
      description,
      color,
      size,
      gender,
      quantity,
      price,
    } = req.body;
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

module.exports = router;
