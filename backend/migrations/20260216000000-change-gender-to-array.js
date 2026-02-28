"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, create a temporary column as ARRAY
    await queryInterface.addColumn("Products", "gender_array", {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
    });

    // Migrate data from gender to gender_array
    // Convert single values to arrays
    await queryInterface.sequelize.query(`
      UPDATE "Products" 
      SET gender_array = ARRAY[gender] 
      WHERE gender IS NOT NULL
    `);

    // Drop the old gender column
    await queryInterface.removeColumn("Products", "gender");

    // Rename the new column to gender
    await queryInterface.renameColumn("Products", "gender_array", "gender");
  },

  down: async (queryInterface, Sequelize) => {
    // First, create a temporary STRING column
    await queryInterface.addColumn("Products", "gender_string", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Migrate data back: take the first element of the array
    await queryInterface.sequelize.query(`
      UPDATE "Products" 
      SET gender_string = gender[1] 
      WHERE gender IS NOT NULL AND array_length(gender, 1) > 0
    `);

    // Drop the old gender column
    await queryInterface.removeColumn("Products", "gender");

    // Rename the new column back to gender
    await queryInterface.renameColumn("Products", "gender_string", "gender");
  },
};
