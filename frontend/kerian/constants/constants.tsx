// ==================== API ====================

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ==================== VALIDATION ====================

export const phoneRegExp =
  /^(\+?[1-9]{1,4}[-\s]?|[0-9]{2,4}[-\s]?)*?[0-9]{3,4}[-\s]?[0-9]{3,4}$/;

// ==================== ORDER ====================

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DELIVERY_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
];

export const ORDER_STATUS_POLL_INTERVAL_MS = 30000;

// ==================== ADMIN STATS ====================

export const STATS_RANGES = ["day", "week", "month", "year"] as const;

export type StatsRange = (typeof STATS_RANGES)[number];

// ==================== SNACKBAR ====================

export const SNACKBAR_AUTO_HIDE_DURATION_MS = 4000;
