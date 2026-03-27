const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { sequelize } = require("../dataBase");
const Product = require("../models/products");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const uploadsDir = path.join(__dirname, "..", "uploads");

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    const products = await Product.findAll();
    const productsToMigrate = products.filter(
      (p) =>
        p.imageUrls &&
        p.imageUrls.length > 0 &&
        p.imageUrls.some((url) => url.startsWith("/uploads"))
    );

    console.log(
      `Found ${productsToMigrate.length} product(s) with local images to migrate.\n`
    );

    for (const product of productsToMigrate) {
      const productSlug = slugify(product.name);
      const newUrls = [];

      for (let i = 0; i < product.imageUrls.length; i++) {
        const url = product.imageUrls[i];

        if (!url.startsWith("/uploads")) {
          newUrls.push(url);
          continue;
        }

        const filename = url.replace("/uploads/", "");
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
          console.warn(`  WARNING: File not found: ${filePath} — skipping`);
          newUrls.push(url);
          continue;
        }

        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: `kerian/products/${productSlug}`,
            public_id: `${productSlug}-${i + 1}`,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          });

          newUrls.push(result.secure_url);
          console.log(`  Uploaded: ${filename} -> ${result.secure_url}`);
        } catch (uploadError) {
          console.error(`  ERROR uploading ${filename}:`, uploadError.message);
          newUrls.push(url);
        }
      }

      await product.update({ imageUrls: newUrls });
      console.log(
        `Migrated ${product.name}: ${newUrls.length} image(s)\n`
      );
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sequelize.close();
  }
}

migrate();
