"use strict";

const {
  PRODUCT_COLORS,
  PRODUCT_GENDERS,
} = require("../constants/filterConstants");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const rows = [
      {
        name: "MonoSkull",
        color: PRODUCT_COLORS.BLACK,
        size: "L",
        gender: PRODUCT_GENDERS.MALE,
      },
      {
        name: "Muse Tee",
        color: PRODUCT_COLORS.BLACK,
        size: "M",
        gender: PRODUCT_GENDERS.FEMALE,
      },
      {
        name: "Secrets of the Lily",
        color: PRODUCT_COLORS.WHITE,
        size: "M",
        gender: PRODUCT_GENDERS.FEMALE,
      },
      {
        name: "Whispers of Grace",
        color: PRODUCT_COLORS.WHITE,
        size: "S",
        gender: PRODUCT_GENDERS.FEMALE,
      },
      {
        name: "Velvet Silence",
        color: PRODUCT_COLORS.BLACK,
        size: "L",
        gender: PRODUCT_GENDERS.MALE,
      },
      {
        name: "Shadows of Bloom",
        color: PRODUCT_COLORS.BLACK,
        size: "M",
        gender: PRODUCT_GENDERS.FEMALE,
      },
      {
        name: "Ivory Bloom",
        color: PRODUCT_COLORS.WHITE,
        size: "L",
        gender: PRODUCT_GENDERS.MALE,
      },
      {
        name: "White Eclipse",
        color: PRODUCT_COLORS.WHITE,
        size: "XL",
        gender: PRODUCT_GENDERS.MALE,
      },
      {
        name: "Lily Veins",
        color: PRODUCT_COLORS.BLACK,
        size: "S",
        gender: PRODUCT_GENDERS.FEMALE,
      },
      {
        name: "Monochrome Muse",
        color: PRODUCT_COLORS.BLACK,
        size: "M",
        gender: PRODUCT_GENDERS.FEMALE,
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
      { color: null, size: null, gender: null },
      {}
    );
  },
};
