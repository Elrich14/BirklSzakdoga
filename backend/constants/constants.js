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

module.exports = {
  ORDER_STATUSES,
  DEFAULT_ORDER_PAGE_SIZE,
  RECOMMENDATION_COUNT,
  RECOMMENDATIONS_MODEL,
};
