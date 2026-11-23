---
name: kerian-backend-rules
description: Express/Sequelize patterns for the Kerian backend — route placement, error shape, status codes, auth middleware, transaction and locking rules. Load before editing anything under backend/.
---

# Kerian backend rules

Load `kerian-conventions` as well. If the change touches `backend/migrations/`
or `backend/models/`, also load `kerian-db-migrations`. If it touches auth,
orders, payment, admin or upload, also load `kerian-security-baseline`.

**`references/patterns.md`** in this skill has the full transaction example,
constants, environment variables and the codebase's gotchas. Read it when you
write a transaction, add a constant or add an env var.

## The backend owns the logic

A standing architectural decision, not a preference. Pricing, stock,
authorization, state transitions, validation and totals are computed **on the
server**. The frontend displays what the server returns.

If a task would put a business rule in the client, that is a backend task.
Say so and implement it here.

## Route placement

`index.js` is a thin bootstrap. It mounts routers and owns nothing else.

| Prefix | File |
|---|---|
| `/auth` | `auth.js` (password), `oauth/routes.js` (Google) |
| `/auth/2fa` | `twoFactorRoutes.js` |
| `/api/products` | `productRoutes.js` |
| `/api/wishlist` | `wishlistRoutes.js` |
| `/api` (orders) | `orderRoutes.js` |
| `/api/orders/webhook` | `stripeWebhook.js` |
| `/api/reviews` | `reviewRoutes.js` |
| `/api/admin` | `adminRoutes.js` |
| `/api/recommendations` | `recommendationsRoutes.js` |

Never create a route file for a single endpoint — add it to the matching file.
A new file needs a genuinely new domain, and then it gets mounted in `index.js`
and documented in `CLAUDE.md`. Every route file exports an `express.Router()`.

## Error responses

Always a JSON object with an `error` key:

```js
return res.status(400).json({ error: "Cart is empty" });
```

The value is either a plain English sentence, or a **translation key** when the
frontend must localise it (the codebase does this — `{ error: "insufficientStock", ... }`
plus structured fields). A key must be added to both `locales/en` and `locales/hu`.

`authenticateToken` uses bare `res.sendStatus(401)` / `sendStatus(403)`. Leave
it that way — changing it breaks existing clients.

| Code | When |
|---|---|
| 200 / 201 / 204 | OK / Created / Deleted, no body |
| 400 | Bad input from the client |
| 401 | No or invalid token |
| 403 | Authenticated but not allowed |
| 404 | Does not exist |
| 409 | Conflict — unique constraint, already-applied state change |
| 413 | Upload too large |
| 500 | Server fault — never leak internals |

## Auth middleware

```js
router.get("/orders", authenticateToken, async (req, res) => { ... });
router.get("/admin/stats", authenticateToken, requireAdmin, async (req, res) => { ... });
```

`requireAdmin` reads `req.user.role`, so it **must** follow `authenticateToken`
and is never used alone. `req.user` is the decoded JWT: `{ id, username, role, scope? }`.
A `TWO_FA_PENDING` scoped token is already rejected by the middleware — do not
re-check per route.

**Ownership checks are not optional.** Any route that reads or mutates a
per-user resource compares against `req.user.id`. A route that takes an id from
the path without that check is an IDOR bug, even if the UI never sends someone
else's id.

## Transactions — the two rules that break most often

1. **Every early return inside a transaction rolls back first.** A missed
   rollback leaks a connection and holds locks. Check each `return`
   individually, not the block as a whole.
2. **A stock or balance read that leads to a write takes a pessimistic lock**
   (`lock: transaction.LOCK.UPDATE`). Without it two concurrent orders both
   pass the same stock check.

`orderRoutes.js` is the reference implementation. The full shape is in
`references/patterns.md`.

## One gotcha you must not trip over

**The Stripe webhook is mounted before `bodyParser.json()`** in `index.js`.
Signature verification needs the raw body. Never move that line, and never add
a body parser above it. The rest of the codebase's gotchas are in
`references/patterns.md`.

## Forbidden

- `eslint-disable`, `@ts-ignore`, `@ts-expect-error` — fix the cause
- An empty `catch {}` without a one-line comment explaining why
- Logging a token, password, recovery code or Stripe secret
- Changing an existing endpoint's response shape without saying so in your
  report — the frontend contract depends on it
