"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      try {
        await queryInterface.removeColumn("Products", "color", {
          transaction: t,
        });
      } catch {}
      try {
        await queryInterface.removeColumn("Products", "size", {
          transaction: t,
        });
      } catch {}

      await queryInterface.addColumn(
        "Products",
        "color",
        {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: true,
        },
        { transaction: t }
      );

      await queryInterface.addColumn(
        "Products",
        "size",
        {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: true,
        },
        { transaction: t }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      try {
        await queryInterface.removeColumn("Products", "color", {
          transaction: t,
        });
      } catch {}
      try {
        await queryInterface.removeColumn("Products", "size", {
          transaction: t,
        });
      } catch {}

      await queryInterface.addColumn(
        "Products",
        "color",
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction: t }
      );

      await queryInterface.addColumn(
        "Products",
        "size",
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction: t }
      );
    });
  },
};
