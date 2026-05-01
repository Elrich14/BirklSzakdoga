const express = require("express");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const Stripe = require("stripe");
const { sequelize } = require("./dataBase");
const { Order, OrderItem, Product, ProductVariant } = require("./models");
const authenticateToken = require("./authenticateToken");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

const SUPPORTED_CURRENCIES = ["HUF", "EUR"];

function toStripeAmount(amountHuf, currency) {
  if (currency === "HUF") {
    return amountHuf;
  }
  if (currency === "EUR") {
    const rate = parseFloat(process.env.EUR_TO_HUF_RATE) || 400;
    return Math.round((amountHuf / rate) * 100);
  }
  throw new Error(`Unsupported currency: ${currency}`);
}

router.post("/orders/checkout-session", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      email,
      shippingAddress,
      billingAddress,
      note,
      language,
      currency,
      cartItems,
    } = req.body;

    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Unsupported currency" });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Cart is empty" });
    }

    const enrichedItems = [];
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

      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({ error: "Product not found" });
      }

      enrichedItems.push({
        productId: product.id,
        productName: product.name,
        productPriceHuf: product.price,
        quantity: item.productQuantity,
        gender: item.gender,
        size: item.size,
        color: item.color,
      });
    }

    for (const item of enrichedItems) {
      await ProductVariant.decrement("stock", {
        by: item.quantity,
        where: {
          productId: item.productId,
          gender: item.gender,
          size: item.size,
          color: item.color,
        },
        transaction,
      });
    }

    const totalPriceHuf = enrichedItems.reduce(
      (sum, item) => sum + item.productPriceHuf * item.quantity,
      0
    );

    let userId = null;
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
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
        totalPrice: totalPriceHuf,
        status: "pending",
        paymentStatus: "pending",
        currency,
      },
      { transaction }
    );

    await Promise.all(
      enrichedItems.map((item) =>
        OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPriceHuf,
            quantity: item.quantity,
            gender: item.gender,
            size: item.size,
            color: item.color,
          },
          { transaction }
        )
      )
    );

    const lineItems = enrichedItems.map((item) => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: item.productName,
          description: `${item.gender} / ${item.size} / ${item.color}`,
        },
        unit_amount: toStripeAmount(item.productPriceHuf, currency),
      },
      quantity: item.quantity,
    }));

    const frontendBase =
      process.env.FRONTEND_BASE_URL || "http://localhost:3001";

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: lineItems,
      payment_method_types: ["card"],
      return_url: `${frontendBase}/order/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        orderId: String(order.id),
        language: language || "en",
      },
      payment_intent_data: {
        metadata: {
          orderId: String(order.id),
          language: language || "en",
        },
      },
    });

    await order.update({ stripeSessionId: session.id }, { transaction });
    await transaction.commit();

    res.json({ clientSecret: session.client_secret, orderId: order.id });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.get("/orders/by-session/:sessionId", async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { stripeSessionId: req.params.sessionId },
      include: [{ model: OrderItem, as: "items" }],
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order by session:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

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

router.get("/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      attributes: ["id", "status", "paymentStatus", "createdAt", "updatedAt"],
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

module.exports = router;
