"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create a temporary column as TEXT[]
    await queryInterface.addColumn("Products", "imageUrls_temp", {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
    });

    // Migrate existing single imageUrl into the array
    await queryInterface.sequelize.query(`
      UPDATE "Products"
      SET "imageUrls_temp" = ARRAY["imageUrl"]
      WHERE "imageUrl" IS NOT NULL
    `);

    // Drop the old scalar column
    await queryInterface.removeColumn("Products", "imageUrl");

    // Rename temp to final name
    await queryInterface.renameColumn("Products", "imageUrls_temp", "imageUrls");
  },

  down: async (queryInterface, Sequelize) => {
    // Create a temporary scalar TEXT column
    await queryInterface.addColumn("Products", "imageUrl_temp", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Take the first element of the array back to scalar
    await queryInterface.sequelize.query(`
      UPDATE "Products"
      SET "imageUrl_temp" = "imageUrls"[1]
      WHERE "imageUrls" IS NOT NULL AND array_length("imageUrls", 1) > 0
    `);

    // Drop the array column
    await queryInterface.removeColumn("Products", "imageUrls");

    // Rename back to imageUrl
    await queryInterface.renameColumn("Products", "imageUrl_temp", "imageUrl");
  },
};
