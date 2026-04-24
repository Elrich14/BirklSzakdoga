// ==================== ORDER ====================

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const DEFAULT_ORDER_PAGE_SIZE = 20;

// ==================== RECOMMENDATIONS ====================

const RECOMMENDATION_COUNT = 3;
const RECOMMENDATIONS_MODEL = "claude-haiku-4-5";

// ==================== OAUTH ====================

const HANDOFF_TTL_MS = 30_000;
const PENDING_TOKEN_TTL = "10m";
const JWT_TTL = "1h";

const GOOGLE_SCOPES = ["email", "profile"];

const OAUTH_RATE_LIMIT_WINDOW_MS = 60_000;
const OAUTH_RATE_LIMIT_MAX = 20;

const TOKEN_SCOPES = {
  GOOGLE_PENDING: "google-pending",
  TWO_FA_PENDING: "2fa-pending",
};

const AUTH_PROVIDERS = {
  LOCAL: "local",
  GOOGLE: "google",
};

const OAUTH_ERROR_CODES = {
  ADMIN_NO_GOOGLE: "admin_no_google",
  EMAIL_ALREADY_REGISTERED: "email_already_registered",
  EMAIL_NOT_VERIFIED: "email_not_verified",
  HANDOFF_INVALID_OR_EXPIRED: "handoff_invalid_or_expired",
  OAUTH_FAILED: "oauth_failed",
  PENDING_TOKEN_INVALID: "pending_token_invalid",
  PENDING_TOKEN_WRONG_SCOPE: "pending_token_wrong_scope",
  USERNAME_TAKEN: "username_taken",
  USERNAME_INVALID_LENGTH: "username_invalid_length",
  USERNAME_INVALID_CHARS: "username_invalid_chars",
};

// ==================== USERNAME ====================

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 50;
const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/;

module.exports = {
  ORDER_STATUSES,
  DEFAULT_ORDER_PAGE_SIZE,
  RECOMMENDATION_COUNT,
  RECOMMENDATIONS_MODEL,
  HANDOFF_TTL_MS,
  PENDING_TOKEN_TTL,
  JWT_TTL,
  GOOGLE_SCOPES,
  OAUTH_RATE_LIMIT_WINDOW_MS,
  OAUTH_RATE_LIMIT_MAX,
  TOKEN_SCOPES,
  AUTH_PROVIDERS,
  OAUTH_ERROR_CODES,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
};
