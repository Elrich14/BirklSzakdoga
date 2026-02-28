/**
 * Centralized constants for product filters
 */

export const PRODUCT_COLORS = {
  BLACK: "black",
  WHITE: "white",
} as const;

export const PRODUCT_SIZES = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "2XL",
  XXXL: "3XL",
  XXXXL: "4XL",
} as const;

export const PRODUCT_GENDERS = {
  MALE: "Male",
  FEMALE: "Female",
} as const;

// Helper arrays for iteration
export const AVAILABLE_COLORS = Object.values(PRODUCT_COLORS);
export const AVAILABLE_SIZES = Object.values(PRODUCT_SIZES);
export const AVAILABLE_GENDERS = Object.values(PRODUCT_GENDERS);

// Type exports for type safety
export type ProductColor = (typeof PRODUCT_COLORS)[keyof typeof PRODUCT_COLORS];
export type ProductSize = (typeof PRODUCT_SIZES)[keyof typeof PRODUCT_SIZES];
export type ProductGender = (typeof PRODUCT_GENDERS)[keyof typeof PRODUCT_GENDERS];
