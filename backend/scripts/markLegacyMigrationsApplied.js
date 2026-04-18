const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { sequelize } = require("../dataBase");

const LEGACY_MIGRATIONS = [
  "20251005152840-add-product-variant-fields.js",
  "20251005161128-drop-and-add-color-size-as-arrays.js",
  "20260216000000-change-gender-to-array.js",
  "20260307000000-create-orders-and-order-items.js",
  "20260307100000-change-orderitems-productid-set-null.js",
  "20260312000000-change-imageurl-to-imageurls-array.js",
  "20260407000000-create-product-variants.js",
  "20260411000000-create-reviews.js",
];

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    await sequelize.query(
      'CREATE TABLE IF NOT EXISTS "SequelizeMeta" (name VARCHAR(255) NOT NULL PRIMARY KEY);'
    );

    const [existingRows] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta";'
    );
    const existing = new Set(existingRows.map((row) => row.name));

    const toInsert = LEGACY_MIGRATIONS.filter((name) => !existing.has(name));

    if (toInsert.length === 0) {
      console.log("All legacy migrations already marked applied. Nothing to do.");
      return;
    }

    for (const name of toInsert) {
      await sequelize.query(
        'INSERT INTO "SequelizeMeta" (name) VALUES (:name) ON CONFLICT (name) DO NOTHING;',
        { replacements: { name } }
      );
      console.log(`Marked as applied: ${name}`);
    }

    console.log(`\nDone. Marked ${toInsert.length} legacy migration(s) as applied.`);
    console.log("You can now run: npx sequelize-cli db:migrate");
  } catch (error) {
    console.error("Failed:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();
