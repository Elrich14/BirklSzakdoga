const multer = require("multer");
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

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next();
    const productName = slugify(req.body.name || "product");
    let uploadIndex = 0;
    for (const file of req.files) {
      uploadIndex += 1;
      const result = await uploadBufferToCloudinary(file.buffer, {
        folder: `kerian/products/${productName}`,
        public_id: `${productName}-${uploadIndex}-${Date.now()}`,
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [{ fetch_format: "auto" }],
      });
      file.path = result.secure_url;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadToCloudinary, cloudinary };
