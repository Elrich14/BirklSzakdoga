"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Users", [
      {
        id: "c3b20c20-db47-4457-a532-709757d5e273",
        username: "erik",
        email: "erik@gmail.com",
        password: bcrypt.hashSync("1234"),
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "user",
      },
      {
        id: "5689af4f-315c-4a86-9da6-946447ee0b86",
        username: "admin",
        email: "admin@gmail.com",
        password: bcrypt.hashSync("admin"),
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "admin",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete(
      "Users",
      {
        email: ["erik@gmail.com", "admin@gmail.com"],
      },
      {}
    );
  },
};
