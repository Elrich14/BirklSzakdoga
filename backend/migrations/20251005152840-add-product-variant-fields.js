"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "color", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Products", "size", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Products", "gender", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addIndex("Products", ["color"]);
    await queryInterface.addIndex("Products", ["size"]);
    await queryInterface.addIndex("Products", ["gender"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Products", ["gender"]);
    await queryInterface.removeIndex("Products", ["size"]);
    await queryInterface.removeIndex("Products", ["color"]);

    await queryInterface.removeColumn("Products", "gender");
    await queryInterface.removeColumn("Products", "size");
    await queryInterface.removeColumn("Products", "color");
  },
};
