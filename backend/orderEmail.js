const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function orderEmail(orderData) {
  const { name, email, shippingAddress, billingAddress, note, cartItems } =
    orderData;

  const itemLines = cartItems
    .map((item, idx) => {
      return `${idx + 1}. ${item.productName} (${item.size}, ${item.color}, ${item.gender}) – ${item.productQuantity} db × ${item.productPrice} Ft`;
    })
    .join("\n");

  const message = `
New order received!:

Name: ${name}
Email: ${email}
Shipping address: ${shippingAddress}
Billing address: ${billingAddress || "Same as shipping address"}
Note: ${note || "-"}

Order details:
${itemLines}
`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "New order received",
    text: message,
  });
}

module.exports = orderEmail;
