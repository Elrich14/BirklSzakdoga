---
name: kerian-security-baseline
description: Security rules and the tracked known gaps (#50-#55) for the Kerian project — what must never regress, what must never be silently fixed, and the required checks for auth, payment, upload and authorization code. Load before touching auth, orders, payment, admin or upload code, and before any security review.
---

# Kerian security baseline

**Reviewing a diff rather than writing code?** `references/review-checklist.md`
has the ten-point review pass and the reporting format. Skip it if you are
implementing — the rules below are what you need.

## The tracked gaps — do not touch them sideways

These are **known, deliberate, and each has its own GitHub issue**. They were
accepted as scope-outs during the Google OAuth rollout (issue #39).

| Gap | Issue |
|---|---|
| JWT stored in `localStorage` — vulnerable to XSS token theft | **#50** |
| In-memory OAuth handoff store (`backend/oauth/handoffStore.js`) — breaks on multi-instance deploy | **#51** |
| No email verification on password registration | **#52** |
| No "link Google to existing account" UI on the profile page | **#53** |
| No device/session management — users cannot revoke sessions | **#54** |
| Admin promotion of password-less Google users can strand the account | **#55** |

Two rules, both absolute:

1. **Never silently fix one.** If your task is not that issue, leave it. A
   drive-by "improvement" to auth storage inside an unrelated change is how
   auth breaks.
2. **Never make one worse.** If your change expands the blast radius of a
   tracked gap (more code reading the token from `localStorage`, more state in
   the in-memory store), say so in your report under `WHAT`.

If a task genuinely requires touching one, report it as `NEEDS-DECISION` with
the issue number named.

## Non-negotiables

### Authentication

- `authenticateToken` on every non-public route. No exceptions "because the UI
  hides the button".
- `requireAdmin` **after** `authenticateToken`, never alone.
- JWT lifetime comes from `JWT_TTL` in `constants/constants.js`. Do not extend it
  inline.
- A `2fa-pending` or `google-pending` scoped token is not a session token.
  `authenticateToken` already rejects `TWO_FA_PENDING`; never add a route that
  accepts a pending-scope token as if it were full auth.

### Authorization

Every route that takes a resource id from the path or body checks ownership
against `req.user.id`, or requires admin. Write the check even when the client
could not plausibly send someone else's id — the client is not a security
boundary.

### Input

- Validate every field that reaches the database or an external API: type,
  range, enum membership.
- Quantities: integer, `> 0`, and bounded. Negative and fractional quantities
  are a real attack on price calculation.
- Enum-like values (`gender`, `size`, `color`, `status`, `currency`) are checked
  against the constant, never trusted from the body.
- Never interpolate request data into a raw SQL string. Use Sequelize bindings.

### Payment

- The Stripe webhook verifies the signature. The raw-body mount order in
  `index.js` exists for that — do not move it.
- A webhook handler is **idempotent**: the same event delivered twice must not
  create two orders or decrement stock twice. Stripe retries by design.
- Prices and totals are computed server-side from the database. A price or total
  arriving in the request body is ignored.

### Secrets

- Never log a token, password, hash, recovery code or API key.
- Never commit a real value to `.env.example` — placeholders only.
- A new secret is added to `backend/utils/env.js` so boot fails fast when it is
  missing.

### Error messages

A 500 never leaks internals. The codebase already has the pattern —
`mapRegistrationError` in `utils/authHelpers.js` deliberately drops the database
message and there is a test asserting it. Follow that shape.

Authentication failures must not reveal whether the account exists.

### Rate limiting

Auth, 2FA and OAuth endpoints are rate limited (`express-rate-limit`,
`rateLimit2FA.js`, the `OAUTH_RATE_LIMIT_*` constants). Any new endpoint that
verifies a secret — a code, a token, a password — gets a limiter too.

### Upload

`upload.js` enforces size and type. Keep both. Never trust a client-supplied
filename or MIME type as the stored value.

## Reviewing rather than writing?

The ten-point review pass and the reporting format live in
`references/review-checklist.md`.
