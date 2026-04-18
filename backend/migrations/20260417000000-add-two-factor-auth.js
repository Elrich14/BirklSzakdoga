"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "twoFactorSecret", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "twoFactorEnabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Users", "twoFactorRecoveryCodes", {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.createTable("TwoFactorAttempts", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      succeeded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("TwoFactorAttempts", ["userId", "createdAt"], {
      name: "two_factor_attempts_user_created_idx",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("TwoFactorAttempts");
    await queryInterface.removeColumn("Users", "twoFactorRecoveryCodes");
    await queryInterface.removeColumn("Users", "twoFactorEnabled");
    await queryInterface.removeColumn("Users", "twoFactorSecret");
  },
};
