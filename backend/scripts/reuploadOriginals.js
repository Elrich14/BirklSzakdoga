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

const parseFilename = (filename) => {
  const match = filename.match(/^(.+)-(\d+)-\d+\.[a-z]+$/i);
  if (!match) return null;
  return {
    slug: match[1],
    index: parseInt(match[2], 10),
    filename,
  };
};

const groupFilesBySlug = (localFiles) => {
  const filesBySlug = new Map();
  for (const filename of localFiles) {
    const parsed = parseFilename(filename);
    if (!parsed) continue;
    if (!filesBySlug.has(parsed.slug)) {
      filesBySlug.set(parsed.slug, []);
    }
    filesBySlug.get(parsed.slug).push(parsed);
  }
  for (const files of filesBySlug.values()) {
    files.sort((first, second) => first.index - second.index);
  }
  return filesBySlug;
};

const reuploadOriginals = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    const localFiles = fs.readdirSync(uploadsDir);
    const filesBySlug = groupFilesBySlug(localFiles);

    console.log(
      `Found ${localFiles.length} local file(s) across ${filesBySlug.size} product slug(s).\n`
    );

    const products = await Product.findAll();
    let reuploadedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const productSlug = slugify(product.name);
      const matchingFiles = filesBySlug.get(productSlug);

      if (!matchingFiles || matchingFiles.length === 0) {
        console.log(`SKIP: No local originals for "${product.name}"`);
        skippedCount++;
        continue;
      }

      console.log(
        `\nReuploading "${product.name}" (${matchingFiles.length} image(s))...`
      );
      const newUrls = [];
      let hadError = false;

      for (const file of matchingFiles) {
        const filePath = path.join(uploadsDir, file.filename);
        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: `kerian/products/${productSlug}`,
            public_id: `${productSlug}-${file.index}-${Date.now()}`,
            transformation: [{ fetch_format: "auto" }],
          });
          newUrls.push(result.secure_url);
          console.log(`  Uploaded: ${file.filename}`);
        } catch (uploadError) {
          console.error(
            `  ERROR uploading ${file.filename}:`,
            uploadError.message
          );
          hadError = true;
        }
      }

      if (hadError) {
        console.warn(
          `Skipping DB update for "${product.name}" — not all uploads succeeded`
        );
        continue;
      }

      await product.update({ imageUrls: newUrls });
      console.log(`Updated DB for "${product.name}"`);
      reuploadedCount++;
    }

    console.log(
      `\nDone. Reuploaded ${reuploadedCount} product(s), skipped ${skippedCount}.`
    );
  } catch (error) {
    console.error("Reupload failed:", error);
  } finally {
    await sequelize.close();
  }
};

reuploadOriginals();
