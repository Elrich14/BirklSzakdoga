"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const FULL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

    const rows = [
      {
        name: "MonoSkull",
        color: ["black", "white"],
        size: FULL_SIZES,
        gender: "Unisex",
      },
      {
        name: "Muse Tee",
        color: ["black", "white"],
        size: ["S", "M", "L", "XL"],
        gender: "Female",
      },
      {
        name: "Secrets of the Lily",
        color: ["white"],
        size: ["M", "L"],
        gender: "Female",
      },
      {
        name: "Whispers of Grace",
        color: ["white"],
        size: ["S", "M"],
        gender: "Female",
      },
      {
        name: "Velvet Silence",
        color: ["black", "white"],
        size: FULL_SIZES,
        gender: "Unisex",
      },
      {
        name: "Shadows of Bloom",
        color: ["black", "white"],
        size: ["M", "L", "XL", "2XL"],
        gender: "Female",
      },
      {
        name: "Ivory Bloom",
        color: ["black", "white"],
        size: ["L", "XL", "2XL", "3XL"],
        gender: "Male",
      },
      {
        name: "White Eclipse",
        color: ["black", "white"],
        size: FULL_SIZES,
        gender: "Unisex",
      },
      {
        name: "Lily Veins",
        color: ["black"],
        size: ["S", "M", "L"],
        gender: "Female",
      },
      {
        name: "Monochrome Muse",
        color: ["black", "white"],
        size: ["M", "L", "XL"],
        gender: "Female",
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
