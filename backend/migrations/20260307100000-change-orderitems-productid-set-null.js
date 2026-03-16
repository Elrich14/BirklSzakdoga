"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("OrderItems", "productId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `ALTER TABLE "OrderItems" DROP CONSTRAINT IF EXISTS "OrderItems_productId_fkey"`
    );

    await queryInterface.sequelize.query(
      `ALTER TABLE "OrderItems"
       ADD CONSTRAINT "OrderItems_productId_fkey"
       FOREIGN KEY ("productId") REFERENCES "Products"("id")
       ON UPDATE CASCADE ON DELETE SET NULL`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `ALTER TABLE "OrderItems" DROP CONSTRAINT IF EXISTS "OrderItems_productId_fkey"`
    );

    await queryInterface.sequelize.query(
      `ALTER TABLE "OrderItems"
       ADD CONSTRAINT "OrderItems_productId_fkey"
       FOREIGN KEY ("productId") REFERENCES "Products"("id")
       ON UPDATE CASCADE ON DELETE CASCADE`
    );

    await queryInterface.changeColumn("OrderItems", "productId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
