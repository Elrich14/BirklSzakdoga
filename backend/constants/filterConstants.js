/**
 * Centralized constants for product filters (Backend)
 * Must match frontend constants to ensure consistency
 */

const PRODUCT_COLORS = {
  BLACK: "black",
  WHITE: "white",
};

const PRODUCT_SIZES = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "2XL",
  XXXL: "3XL",
  XXXXL: "4XL",
};

const PRODUCT_GENDERS = {
  MALE: "Male",
  FEMALE: "Female",
};

// Helper arrays for iteration
const AVAILABLE_COLORS = Object.values(PRODUCT_COLORS);
const AVAILABLE_SIZES = Object.values(PRODUCT_SIZES);
const AVAILABLE_GENDERS = Object.values(PRODUCT_GENDERS);

module.exports = {
  PRODUCT_COLORS,
  PRODUCT_SIZES,
  PRODUCT_GENDERS,
  AVAILABLE_COLORS,
  AVAILABLE_SIZES,
  AVAILABLE_GENDERS,
};
