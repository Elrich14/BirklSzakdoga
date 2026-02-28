const { sequelize } = require("../dataBase.js");
const Product = require("../models/products.js");
const {
  PRODUCT_COLORS,
  PRODUCT_GENDERS,
  AVAILABLE_SIZES,
} = require("../constants/filterConstants.js");

async function seedProducts() {
  await sequelize.sync(); // creates the table if it doesn't exist

  const productList = [
    {
      name: "MonoSkull",
      description:
        "A black and white t-shirt featuring a high-contrast skull design — minimal, bold, and timeless.",
      imageUrl:
        "https://alghulperformanceshop.com/cdn/shop/files/1909431069100900229_2048.jpg?v=1705164828",
      price: 11990,
      category: "clothing",
      color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
      size: AVAILABLE_SIZES,
      gender: [PRODUCT_GENDERS.MALE, PRODUCT_GENDERS.FEMALE],
    },
    {
      name: "Muse Tee",
      description:
        "Soft b&w t-shirt featuring a minimalist portrait of a mysterious woman — artistic and elegant.",
      imageUrl: "https://i00.eu/img/602/1024x1024/cy7p9m1d/121204.jpg",
      price: 8990,
      category: "clothing",
      color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
      size: ["XS", "S", "M", "L", "XL"],
      gender: [PRODUCT_GENDERS.FEMALE],
    },
    {
      name: "Secrets of the Lily",
      description:
        "Stylish shirt with a feminine body silhouette intertwined with blooming lilies — graceful and edgy.",
      imageUrl:
        "https://static.musictoday.com/store/bands/4372/product_large/X3CTAC1497-02.jpg",
      price: 9490,
      category: "clothing",
      color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
      size: ["XS", "S", "M", "L"],
      gender: [PRODUCT_GENDERS.FEMALE],
    },
    {
      name: "Whispers of Grace",
      description:
        "A flowing white design meets the contours of a feminine silhouette, delicately wrapped in grayscale lilies — subtle, poetic, and timeless.",
      imageUrl: "https://f4.bcbits.com/img/0037995552_71.jpg",
      price: 6590,
      category: "clothing",
      color: [PRODUCT_COLORS.WHITE],
      size: ["XS", "S", "M", "L", "XL"],
      gender: [PRODUCT_GENDERS.FEMALE],
    },
    {
      name: "Velvet Silence",
      description:
        "This minimalist black tee features a silhouetted figure embraced by white floral lines — a tribute to quiet strength and hidden elegance.",
      imageUrl:
        "https://ih1.redbubble.net/image.461806914.9838/ssrco,essential_tee,womens_01,101010:01c5ca27c6,front,product_square,x600.1u2.jpg",
      price: 12000,
      category: "clothing",
      color: [PRODUCT_COLORS.BLACK],
      size: ["S", "M", "L", "XL", "2XL"],
      gender: [PRODUCT_GENDERS.FEMALE],
    },
    {
      name: "Shadows of Bloom",
      description:
        "A stark contrast between light and form — this bold design pairs a feminine figure with blooming lilies, rooted in mystery.",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj-ukwoq7knfwKho36zII7KKhDiE1o87-Szg&s",
      price: 9000,
      category: "clothing",
      color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
      size: ["M", "L", "XL"],
      gender: [PRODUCT_GENDERS.MALE, PRODUCT_GENDERS.FEMALE],
    },
    {
      name: "Ivory Bloom",
      description:
        "Where monochrome meets movement: a black shirt with a graceful body outline and soft white lilies, blooming like thoughts unspoken.",
      imageUrl:
        "https://www.ikks.com/dw/image/v2/BFQN_PRD/on/demandware.static/-/Sites-ikks_master_v0/default/dw3cf70ceb/produits/XU12043-02/IKKS-CHEMISE~NOIRE~ET~IVOIRE~MINI~ME~FLEURS~ECOVERO~~GARCON~-XU12043-02_7.jpg?sw=395&sh=508",
      price: 9199,
      category: "clothing",
      color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
      size: ["XS", "S", "M", "L"],
      gender: [PRODUCT_GENDERS.MALE],
    },
    {
      name: "White Eclipse",
      description:
        "A silhouette partially revealed, adorned with inverted lilies — abstract, mysterious, and deeply expressive in black and white.",
      imageUrl:
        "https://costacasual.com/cdn/shop/files/unisex-classic-tee-white-back-666334a4c571e.jpg?v=1717777583&width=1946",
      price: 7999,
      category: "clothing",
      color: [PRODUCT_COLORS.WHITE],
      size: ["XS", "S", "M", "L", "XL", "2XL"],
      gender: [PRODUCT_GENDERS.MALE, PRODUCT_GENDERS.FEMALE],
    },
    {
      name: "Lily Veins",
      description:
        "Elegant white floral patterns pulse like lifelines across a silent figure — symbolic and raw, crafted for monochrome souls.",
      imageUrl:
        "https://m.media-amazon.com/images/I/A16YlCTQRlL._CLa%7C2140%2C2000%7C81A0gc2nXQL.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_UY1000_.png",
      price: 7650,
      category: "clothing",
      color: [PRODUCT_COLORS.WHITE],
      size: ["M", "L", "XL"],
      gender: [PRODUCT_GENDERS.MALE],
    },
    {
      name: "Monochrome Muse",
      description:
        "Inspired by classic sculpture and modern minimalism, this black and white tee captures the quiet confidence of a muse in bloom.",
      imageUrl:
        "https://i.etsystatic.com/47587750/r/il/c3f934/5961664942/il_570xN.5961664942_bb4b.jpg",
      price: 8599,
      category: "clothing",
      color: [PRODUCT_COLORS.BLACK, PRODUCT_COLORS.WHITE],
      size: ["XS", "S", "M", "L", "XL"],
      gender: [PRODUCT_GENDERS.FEMALE],
    },
  ];

  for (const productData of productList) {
    const existing = await Product.findOne({
      where: { name: productData.name },
    });

    if (existing) {
      await existing.update(productData);
      console.log(`Updated: ${productData.name}`);
    } else {
      await Product.create(productData);
      console.log(`Created: ${productData.name}`);
    }
  }

  console.log("Products have been seeded.");
  await sequelize.close();
}

seedProducts().catch((err) => {
  console.error("Error seeding products:", err);
});
