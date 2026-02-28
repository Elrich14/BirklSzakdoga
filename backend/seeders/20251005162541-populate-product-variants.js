"use strict";

const {
  AVAILABLE_SIZES,
  PRODUCT_GENDERS,
  PRODUCT_COLORS,
} = require("../constants/filterConstants");

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const FULL_SIZES = AVAILABLE_SIZES;

    const rows = [
      {
        name: "MonoSkull",
        color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
        size: FULL_SIZES,
        gender: [PRODUCT_GENDERS.MALE, PRODUCT_GENDERS.FEMALE],
      },
      {
        name: "Muse Tee",
        color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
        size: ["S", "M", "L", "XL"],
        gender: [PRODUCT_GENDERS.FEMALE],
      },
      {
        name: "Secrets of the Lily",
        color: [PRODUCT_COLORS.WHITE],
        size: ["M", "L"],
        gender: [PRODUCT_GENDERS.FEMALE],
      },
      {
        name: "Whispers of Grace",
        color: [PRODUCT_COLORS.WHITE],
        size: ["S", "M"],
        gender: [PRODUCT_GENDERS.FEMALE],
      },
      {
        name: "Velvet Silence",
        color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
        size: FULL_SIZES,
        gender: [PRODUCT_GENDERS.MALE],
      },
      {
        name: "Shadows of Bloom",
        color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
        size: ["M", "L", "XL", "2XL"],
        gender: [PRODUCT_GENDERS.MALE, PRODUCT_GENDERS.FEMALE],
      },
      {
        name: "Ivory Bloom",
        color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
        size: ["L", "XL", "2XL", "3XL"],
        gender: [PRODUCT_GENDERS.MALE],
      },
      {
        name: "White Eclipse",
        color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
        size: FULL_SIZES,
        gender: [PRODUCT_GENDERS.MALE, PRODUCT_GENDERS.FEMALE],
      },
      {
        name: "Lily Veins",
        color: [PRODUCT_COLORS.BLACK],
        size: ["S", "M", "L"],
        gender: [PRODUCT_GENDERS.FEMALE],
      },
      {
        name: "Monochrome Muse",
        color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
        size: ["M", "L", "XL"],
        gender: [PRODUCT_GENDERS.FEMALE],
      },
    ];

    for (const r of rows) {
      await queryInterface.bulkUpdate(
        "Products",
        { color: r.color, size: r.size, gender: r.gender, updatedAt: now },
        { name: r.name }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      "Products",
      { color: "{}", size: "{}" },
      {
        name: [
          "MonoSkull",
          "Muse Tee",
          "Secrets of the Lily",
          "Whispers of Grace",
          "Velvet Silence",
          "Shadows of Bloom",
          "Ivory Bloom",
          "White Eclipse",
          "Lily Veins",
          "Monochrome Muse",
        ],
      }
    );
  },
};
