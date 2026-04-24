const crypto = require("crypto");
const { HANDOFF_TTL_MS } = require("../constants/constants");

const store = new Map();

function purgeExpired() {
  const now = Date.now();
  for (const [code, entry] of store) {
    if (entry.expiresAt < now) store.delete(code);
  }
}

function put(payload) {
  purgeExpired();
  const code = crypto.randomBytes(32).toString("hex");
  store.set(code, { payload, expiresAt: Date.now() + HANDOFF_TTL_MS });
  return code;
}

function takeOnce(code) {
  purgeExpired();
  const entry = store.get(code);
  if (!entry) return null;
  store.delete(code);
  if (entry.expiresAt < Date.now()) return null;
  return entry.payload;
}

module.exports = { put, takeOnce };
