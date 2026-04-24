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

// ==================== OAUTH ====================

export const USERNAME_AVAILABILITY_DEBOUNCE_MS = 300;

export const AUTH_PROVIDERS = {
  LOCAL: "local",
  GOOGLE: "google",
} as const;

export type AuthProvider =
  (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS];

export const OAUTH_ERROR_CODES = {
  ADMIN_NO_GOOGLE: "admin_no_google",
  EMAIL_ALREADY_REGISTERED: "email_already_registered",
  EMAIL_NOT_VERIFIED: "email_not_verified",
  HANDOFF_EXPIRED: "handoff_expired",
  OAUTH_FAILED: "oauth_failed",
} as const;

export type OAuthErrorCode =
  (typeof OAUTH_ERROR_CODES)[keyof typeof OAUTH_ERROR_CODES];

export const OAUTH_ERROR_I18N_KEYS: Record<OAuthErrorCode, string> = {
  admin_no_google: "snackbar.oauthAdminBlocked",
  email_already_registered: "snackbar.oauthEmailInUse",
  email_not_verified: "snackbar.oauthEmailNotVerified",
  handoff_expired: "snackbar.oauthHandoffExpired",
  oauth_failed: "snackbar.oauthFailed",
};

// ==================== USERNAME ====================

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 50;
export const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/;
