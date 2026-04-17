const express = require("express");
const { Order, OrderItem, Review, User } = require("./models");
const authenticateToken = require("./authenticateToken");

const router = express.Router();

// GET /api/reviews?productId=123
router.get("/", async (req, res) => {
  const productId = parseInt(req.query.productId, 10);

  if (!productId) {
    return res.status(400).json({ error: "productId query param required" });
  }

  try {
    const reviews = await Review.findAll({
      where: { productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// GET /api/reviews/can-review/:productId
// Returns { canReview: boolean, reason: "not-purchased" | "not-delivered" | "already-reviewed" | null }
router.get(
  "/can-review/:productId",
  authenticateToken,
  async (req, res) => {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId, 10);

    if (!productId) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    try {
      const existingReview = await Review.findOne({
        where: { userId, productId },
      });

      if (existingReview) {
        return res.json({ canReview: false, reason: "already-reviewed" });
      }

      const deliveredOrder = await Order.findOne({
        where: { userId, status: "delivered" },
        include: [
          {
            model: OrderItem,
            as: "items",
            where: { productId },
            required: true,
          },
        ],
      });

      if (!deliveredOrder) {
        const anyOrder = await Order.findOne({
          where: { userId },
          include: [
            {
              model: OrderItem,
              as: "items",
              where: { productId },
              required: true,
            },
          ],
        });

        if (!anyOrder) {
          return res.json({ canReview: false, reason: "not-purchased" });
        }
        return res.json({ canReview: false, reason: "not-delivered" });
      }

      res.json({ canReview: true, reason: null });
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      res.status(500).json({ error: "Failed to check eligibility" });
    }
  }
);

// POST /api/reviews
router.post("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) {
    return res.status(400).json({ error: "productId and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be between 1 and 5" });
  }

  try {
    const deliveredOrder = await Order.findOne({
      where: { userId, status: "delivered" },
      include: [
        {
          model: OrderItem,
          as: "items",
          where: { productId },
          required: true,
        },
      ],
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        error: "You can only review products from delivered orders",
      });
    }

    const review = await Review.create({
      userId,
      productId,
      rating,
      comment: comment || null,
    });

    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
        },
      ],
    });

    res.status(201).json(reviewWithUser);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ error: "You have already reviewed this product" });
    }
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// DELETE /api/reviews/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);

  try {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const isOwner = review.userId === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await review.destroy();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
