const User = require("./models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/register", (req, res) => {
  const user = req.body;
  const hashedPassword = bcrypt.hashSync(user.password);
  user.password = hashedPassword;
  User.create(user)
    .then((user) => {
      res.json(user.dataValues);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

module.exports = router;
