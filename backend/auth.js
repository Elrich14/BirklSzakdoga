const User = require("./models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res) => {
  User.findOne({
    where: { email: req.body.email },
  })
    .then((user) => {
      if (bcrypt.compareSync(req.body.password, user.dataValues.password)) {
        res.json(user.dataValues);
      } else {
        res.status(400).json(err);
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
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
