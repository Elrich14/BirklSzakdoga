const express = require("express");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { sequelize } = require("./dataBase");
const { Order, OrderItem, ProductVariant } = require("./models");
const authenticateToken = require("./authenticateToken");
const orderEmail = require("./orderEmail");

const router = express.Router();

// POST /api/orderEmail
router.post("/orderEmail", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, shippingAddress, billingAddress, note, cartItems } =
      req.body;

    for (const item of cartItems) {
      const variant = await ProductVariant.findOne({
        where: {
          productId: item.productId,
          gender: item.gender,
          size: item.size,
          color: item.color,
        },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!variant || variant.stock < item.productQuantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: "insufficientStock",
          productName: item.productName,
          size: item.size,
          color: item.color,
          gender: item.gender,
          available: variant ? variant.stock : 0,
          requested: item.productQuantity,
        });
      }
    }

    for (const item of cartItems) {
      await ProductVariant.decrement("stock", {
        by: item.productQuantity,
        where: {
          productId: item.productId,
          gender: item.gender,
          size: item.size,
          color: item.color,
        },
        transaction,
      });
    }

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

    const order = await Order.create(
      {
        userId,
        customerName: name,
        customerEmail: email,
        shippingAddress,
        billingAddress: billingAddress || null,
        note: note || null,
        totalPrice,
        status: "pending",
      },
      { transaction }
    );

    await Promise.all(
      cartItems.map((item) =>
        OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.productQuantity,
            gender: item.gender || null,
            size: item.size || null,
            color: item.color || null,
          },
          { transaction }
        )
      )
    );

    await transaction.commit();

    await orderEmail({ ...req.body, username });
    res.json({ orderId: order.id, status: order.status });
  } catch (error) {
    await transaction.rollback();
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// GET /api/orders/my — matches by userId OR by customerEmail (catches guest orders placed with same email)
router.get("/orders/my", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        [Op.or]: [
          { userId: req.user.id },
          { customerEmail: req.user.email },
        ],
      },
      order: [["createdAt", "DESC"]],
      include: [{ model: OrderItem, as: "items" }],
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id/status
router.get("/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      attributes: ["id", "status", "createdAt", "updatedAt"],
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({
      orderId: order.id,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

module.exports = router;
