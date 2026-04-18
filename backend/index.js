const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { sequelize } = require("./dataBase");

const authRoutes = require("./auth");
const twoFactorRoutes = require("./twoFactorRoutes");
const productRoutes = require("./productRoutes");
const wishlistRoutes = require("./wishlistRoutes");
const orderRoutes = require("./orderRoutes");
const reviewRoutes = require("./reviewRoutes");
const adminRoutes = require("./adminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/auth/2fa", twoFactorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ error: "File too large. Maximum size is 15MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
  next();
});

app.get("*", (req, res) => {
  res.status(404).json({ error: "Invalid endpoint" });
});

app.listen(PORT, async () => {
  try {
    require("./models");
    await sequelize.authenticate();
    await sequelize.sync({ force: false });

    console.log(
      "Connection to the database has been established successfully."
    );
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
