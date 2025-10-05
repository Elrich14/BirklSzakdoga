"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const rows = [
      { name: "MonoSkull", color: "black", size: "L", gender: "Unisex" },
      { name: "Muse Tee", color: "black", size: "M", gender: "Female" },
      {
        name: "Secrets of the Lily",
        color: "white",
        size: "M",
        gender: "Female",
      },
      {
        name: "Whispers of Grace",
        color: "white",
        size: "S",
        gender: "Female",
      },
      { name: "Velvet Silence", color: "black", size: "L", gender: "Unisex" },
      { name: "Shadows of Bloom", color: "black", size: "M", gender: "Female" },
      { name: "Ivory Bloom", color: "white", size: "L", gender: "Male" },
      { name: "White Eclipse", color: "white", size: "XL", gender: "Unisex" },
      { name: "Lily Veins", color: "black", size: "S", gender: "Female" },
      { name: "Monochrome Muse", color: "black", size: "M", gender: "Female" },
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
