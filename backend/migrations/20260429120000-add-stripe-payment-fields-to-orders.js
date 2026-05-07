"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Orders", "paymentStatus", {
      type: Sequelize.ENUM("pending", "paid", "failed", "expired"),
      allowNull: false,
      defaultValue: "pending",
    });

    await queryInterface.addColumn("Orders", "stripeSessionId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("Orders", "stripePaymentIntentId", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Orders", "currency", {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: "HUF",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Orders", "currency");
    await queryInterface.removeColumn("Orders", "stripePaymentIntentId");
    await queryInterface.removeColumn("Orders", "stripeSessionId");
    await queryInterface.removeColumn("Orders", "paymentStatus");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Orders_paymentStatus";'
    );
  },
};
