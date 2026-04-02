const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.EMAIL_PASS,
  },
});

function formatItemLines(cartItems) {
  return cartItems
    .map((item, idx) => {
      return `${idx + 1}. ${item.productName} (${item.size}, ${item.color}, ${item.gender}) – ${item.productQuantity} db × ${item.productPrice} Ft`;
    })
    .join("\n");
}

function buildAdminEmail(orderData) {
  const { name, email, shippingAddress, billingAddress, note, cartItems } =
    orderData;

  return `
New order received!

Name: ${name}
Email: ${email}
Shipping address: ${shippingAddress}
Billing address: ${billingAddress || "Same as shipping address"}
Note: ${note || "-"}

Order details:
${formatItemLines(cartItems)}
`;
}

function buildCustomerEmail(orderData) {
  const {
    username,
    name,
    shippingAddress,
    billingAddress,
    note,
    cartItems,
    language,
  } = orderData;

  const displayName = username || name;

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.productQuantity,
    0
  );

  if (language === "hu") {
    return `Kedves ${displayName},

Köszönjük, hogy a Kerian webáruházban vásároltál!

Rendelésed részletei:

${formatItemLines(cartItems)}

Összesen: ${totalPrice} Ft

Szállítási cím: ${shippingAddress}
${billingAddress ? `Számlázási cím: ${billingAddress}` : ""}
${note ? `Megjegyzés: ${note}` : ""}

Hamarosan felvesszük veled a kapcsolatot a rendelésed feldolgozásával kapcsolatban.

Üdvözlettel,
A Kerian csapata`;
  }

  return `Dear ${displayName},

Thank you for shopping at Kerian!

Your order details:

${formatItemLines(cartItems)}

Total: ${totalPrice} Ft

Shipping address: ${shippingAddress}
${billingAddress ? `Billing address: ${billingAddress}` : ""}
${note ? `Note: ${note}` : ""}

We will contact you shortly regarding the processing of your order.

Best regards,
The Kerian Team`;
}

async function orderEmail(orderData) {
  const { email, language } = orderData;

  const adminSubject = "New order received";
  const customerSubject =
    language === "hu" ? "Rendelés visszaigazolás – Kerian" : "Order confirmation – Kerian";

  await Promise.all([
    transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: process.env.EMAIL_ADMIN,
      subject: adminSubject,
      text: buildAdminEmail(orderData),
    }),
    transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: email,
      subject: customerSubject,
      text: buildCustomerEmail(orderData),
    }),
  ]);
}

module.exports = orderEmail;
