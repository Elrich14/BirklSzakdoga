const express = require("express");
const Stripe = require("stripe");
const { sequelize } = require("./dataBase");
const { Order, OrderItem, ProductVariant } = require("./models");
const orderEmail = require("./orderEmail");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object);
        break;
      case "checkout.session.expired":
        await releaseStockForOrder(
          event.data.object.metadata?.orderId,
          "expired"
        );
        break;
      case "payment_intent.payment_failed":
        await releaseStockForOrder(
          event.data.object.metadata?.orderId,
          "failed"
        );
        break;
      default:
        // Unhandled event type — ack to prevent retries
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.error(`Error handling Stripe event ${event.type}:`, error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

async function loadOrderById(orderId) {
  if (!orderId) return null;
  return Order.findByPk(parseInt(orderId, 10), {
    include: [{ model: OrderItem, as: "items" }],
  });
}

async function onCheckoutCompleted(session) {
  const order = await loadOrderById(session.metadata?.orderId);

  if (!order) {
    console.error(`Order not found for session ${session.id}`);
    return;
  }

  if (order.paymentStatus === "paid") {
    return;
  }

  await order.update({
    paymentStatus: "paid",
    status: "confirmed",
    stripePaymentIntentId: session.payment_intent || null,
  });

  await orderEmail({
    name: order.customerName,
    email: order.customerEmail,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    note: order.note,
    language: session.metadata?.language || "en",
    cartItems: order.items.map((item) => ({
      productName: item.productName,
      productPrice: item.productPrice,
      productQuantity: item.quantity,
      gender: item.gender,
      size: item.size,
      color: item.color,
    })),
  });
}

async function releaseStockForOrder(orderId, finalStatus) {
  if (!orderId) return;

  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(parseInt(orderId, 10), {
      include: [{ model: OrderItem, as: "items" }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order || order.paymentStatus !== "pending") {
      await transaction.commit();
      return;
    }

    for (const item of order.items) {
      if (!item.productId) continue;
      await ProductVariant.increment("stock", {
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

    await order.update({ paymentStatus: finalStatus }, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = router;
