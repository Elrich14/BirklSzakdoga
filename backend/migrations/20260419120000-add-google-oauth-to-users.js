"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "googleId", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "authProvider", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "local",
    });

    await queryInterface.addIndex("Users", ["googleId"], {
      unique: true,
      name: "users_googleId_unique",
      where: { googleId: { [Sequelize.Op.ne]: null } },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Users", "users_googleId_unique");
    await queryInterface.removeColumn("Users", "authProvider");
    await queryInterface.removeColumn("Users", "googleId");
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
