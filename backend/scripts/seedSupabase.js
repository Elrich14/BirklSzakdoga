const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_HOST?.includes("supabase")
        ? { require: true, rejectUnauthorized: false }
        : false,
    },
  }
);

const products = [
  {
    id: 1,
    name: "MonoSkull",
    description: "A black and white t-shirt featuring a high-contrast skull design — minimal, bold, and timeless.",
    price: 11990,
    category: "clothing",
    imageUrls: ["https://alghulperformanceshop.com/cdn/shop/files/1909431069100900229_2048.jpg?v=1705164828"],
    color: ["black", "white"],
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    gender: ["Male", "Female"],
  },
  {
    id: 2,
    name: "Muse Tee",
    description: "Soft b&w t-shirt featuring a minimalist portrait of a mysterious woman — artistic and elegant.",
    price: 8990,
    category: "clothing",
    imageUrls: ["https://i00.eu/img/602/1024x1024/cy7p9m1d/121204.jpg"],
    color: ["black", "white"],
    size: ["XS", "S", "M", "L", "XL"],
    gender: ["Female"],
  },
  {
    id: 3,
    name: "Secrets of the Lily",
    description: "Stylish shirt with a feminine body silhouette intertwined with blooming lilies — graceful and edgy.",
    price: 9490,
    category: "clothing",
    imageUrls: ["https://static.musictoday.com/store/bands/4372/product_large/X3CTAC1497-02.jpg"],
    color: ["black", "white"],
    size: ["XS", "S", "M", "L"],
    gender: ["Female"],
  },
  {
    id: 4,
    name: "Whispers of Grace",
    description: "A flowing white design meets the contours of a feminine silhouette, delicately wrapped in grayscale lilies — subtle, poetic, and timeless.",
    price: 6590,
    category: "clothing",
    imageUrls: ["https://f4.bcbits.com/img/0037995552_71.jpg"],
    color: ["white"],
    size: ["XS", "S", "M", "L", "XL"],
    gender: ["Female"],
  },
  {
    id: 5,
    name: "Velvet Silence",
    description: "This minimalist black tee features a silhouetted figure embraced by white floral lines — a tribute to quiet strength and hidden elegance.",
    price: 12000,
    category: "clothing",
    imageUrls: ["https://ih1.redbubble.net/image.461806914.9838/ssrco,essential_tee,womens_01,101010:01c5ca27c6,front,product_square,x600.1u2.jpg"],
    color: ["black"],
    size: ["S", "M", "L", "XL", "2XL"],
    gender: ["Female"],
  },
  {
    id: 6,
    name: "Shadows of Bloom",
    description: "A stark contrast between light and form — this bold design pairs a feminine figure with blooming lilies, rooted in mystery.",
    price: 9000,
    category: "clothing",
    imageUrls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj-ukwoq7knfwKho36zII7KKhDiE1o87-Szg&s"],
    color: ["black", "white"],
    size: ["M", "L", "XL"],
    gender: ["Male", "Female"],
  },
  {
    id: 7,
    name: "Ivory Bloom",
    description: "Where monochrome meets movement: a black shirt with a graceful body outline and soft white lilies, blooming like thoughts unspoken.",
    price: 9199,
    category: "clothing",
    imageUrls: ["https://www.ikks.com/dw/image/v2/BFQN_PRD/on/demandware.static/-/Sites-ikks_master_v0/default/dw3cf70ceb/produits/XU12043-02/IKKS-CHEMISE~NOIRE~ET~IVOIRE~MINI~ME~FLEURS~ECOVERO~~GARCON~-XU12043-02_7.jpg?sw=395&sh=508"],
    color: ["black", "white"],
    size: ["XS", "S", "M", "L"],
    gender: ["Male"],
  },
  {
    id: 8,
    name: "White Eclipse",
    description: "A silhouette partially revealed, adorned with inverted lilies — abstract, mysterious, and deeply expressive in black and white.",
    price: 7999,
    category: "clothing",
    imageUrls: ["https://costacasual.com/cdn/shop/files/unisex-classic-tee-white-back-666334a4c571e.jpg?v=1717777583&width=1946"],
    color: ["white"],
    size: ["XS", "S", "M", "L", "XL", "2XL"],
    gender: ["Male", "Female"],
  },
  {
    id: 9,
    name: "Lily Veins",
    description: "Elegant white floral patterns pulse like lifelines across a silent figure — symbolic and raw, crafted for monochrome souls.",
    price: 7650,
    category: "clothing",
    imageUrls: ["https://m.media-amazon.com/images/I/A16YlCTQRlL._CLa%7C2140%2C2000%7C81A0gc2nXQL.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_UY1000_.png"],
    color: ["white"],
    size: ["M", "L", "XL"],
    gender: ["Male"],
  },
  {
    id: 10,
    name: "Monochrome Muse",
    description: "Inspired by classic sculpture and modern minimalism, this black and white tee captures the quiet confidence of a muse in bloom.",
    price: 8599,
    category: "clothing",
    imageUrls: ["https://i.etsystatic.com/47587750/r/il/c3f934/5961664942/il_570xN.5961664942_bb4b.jpg"],
    color: ["black", "white"],
    size: ["XS", "S", "M", "L", "XL"],
    gender: ["Female"],
  },
  {
    id: 11,
    name: "Beyle's Skull",
    description: "This premium short-sleeve crewneck features a high-contrast, hand-drawn skull illustration printed on a deep charcoal black base. Crafted from soft, breathable cotton, it offers a tailored fit that sits perfectly under a leather jacket or as a standalone statement piece.",
    price: 8300,
    category: "clothing",
    imageUrls: [
      "https://res.cloudinary.com/ddwipqmjj/image/upload/v1774638497/kerian/products/beyle-s-skull/beyle-s-skull-1.jpg",
      "https://res.cloudinary.com/ddwipqmjj/image/upload/v1774638498/kerian/products/beyle-s-skull/beyle-s-skull-2.jpg",
    ],
    color: ["black", "white"],
    size: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    gender: ["Male", "Female"],
  },
  {
    id: 14,
    name: "Beyle's face",
    description: "This short-sleeve crewneck is made from soft, jet-black cotton and features a striking white line-art portrait on the chest. The minimalist, hand-drawn aesthetic and classic fit make it a versatile staple for layering with leather or bold patterns.",
    price: 5000,
    category: "clothing",
    imageUrls: [
      "https://res.cloudinary.com/ddwipqmjj/image/upload/v1774638477/kerian/products/beyle-s-face/beyle-s-face-1.jpg",
      "https://res.cloudinary.com/ddwipqmjj/image/upload/v1774638479/kerian/products/beyle-s-face/beyle-s-face-2.jpg",
      "https://res.cloudinary.com/ddwipqmjj/image/upload/v1774638481/kerian/products/beyle-s-face/beyle-s-face-3.jpg",
    ],
    color: ["black", "white"],
    size: ["M", "S", "XS"],
    gender: ["Female"],
  },
  {
    id: 15,
    name: "Beyle's Fck",
    description: "Miss Wild and Independent",
    price: 4700,
    category: "clothing",
    imageUrls: [
      "https://res.cloudinary.com/ddwipqmjj/image/upload/v1774638484/kerian/products/beyle-s-fck/beyle-s-fck-1.jpg",
      "https://res.cloudinary.com/ddwipqmjj/image/upload/v1774638488/kerian/products/beyle-s-fck/beyle-s-fck-2.jpg",
      "https://res.cloudinary.com/ddwipqmjj/image/upload/v1774638494/kerian/products/beyle-s-fck/beyle-s-fck-3.jpg",
    ],
    color: ["black"],
    size: ["4XL", "L", "M", "S", "XS"],
    gender: ["Female", "Male"],
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Supabase database.");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Products" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        "imageUrls" TEXT[],
        price INTEGER NOT NULL,
        category VARCHAR(255),
        color TEXT[],
        size TEXT[],
        gender TEXT[],
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Products table ready.");

    for (const product of products) {
      await sequelize.query(
        `INSERT INTO "Products" (id, name, description, "imageUrls", price, category, color, size, gender, "createdAt", "updatedAt")
         VALUES (:id, :name, :description, :imageUrls::text[], :price, :category, :color::text[], :size::text[], :gender::text[], NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           "imageUrls" = EXCLUDED."imageUrls",
           price = EXCLUDED.price,
           category = EXCLUDED.category,
           color = EXCLUDED.color,
           size = EXCLUDED.size,
           gender = EXCLUDED.gender,
           "updatedAt" = NOW()`,
        {
          replacements: {
            id: product.id,
            name: product.name,
            description: product.description,
            imageUrls: `{${product.imageUrls.map((u) => `"${u}"`).join(",")}}`,
            price: product.price,
            category: product.category,
            color: `{${product.color.join(",")}}`,
            size: `{${product.size.join(",")}}`,
            gender: `{${product.gender.join(",")}}`,
          },
        }
      );
      console.log(`  Seeded: ${product.name}`);
    }

    await sequelize.query(
      `SELECT setval('"Products_id_seq"', (SELECT MAX(id) FROM "Products"));`
    );

    console.log("\nAll products seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await sequelize.close();
  }
}

seed();
