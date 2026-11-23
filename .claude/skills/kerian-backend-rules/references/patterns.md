# Backend patterns — full reference

Read this when you write a transaction, add a constant, or add an environment
variable. The rules themselves are in `SKILL.md`; this is the shape to copy.

## Transactions

`orderRoutes.js` is the reference implementation:

```js
const transaction = await sequelize.transaction();
try {
  // every early return rolls back FIRST
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    await transaction.rollback();
    return res.status(400).json({ error: "Unsupported currency" });
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    await transaction.rollback();
    return res.status(400).json({ error: "Cart is empty" });
  }

  // ... work ...

  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  return res.status(500).json({ error: "Internal server error" });
}
```

The pattern that matters: **the rollback is on the same path as the return, not
in the catch alone.** A `return` that skips it leaves the transaction open.

## Pessimistic locking

A read whose result decides a write must lock the row:

```js
const variant = await ProductVariant.findOne({
  where: { productId, gender, size, color },
  lock: transaction.LOCK.UPDATE,
  transaction,
});

if (!variant || variant.stock < requestedQuantity) {
  await transaction.rollback();
  return res.status(400).json({
    error: "insufficientStock",
    available: variant ? variant.stock : 0,
    requested: requestedQuantity,
  });
}
```

The variant lookup tuple is always `(productId, gender, size, color)` — that is
the cart identity in this project, and the same tuple appears in the decrement:

```js
await ProductVariant.decrement("stock", {
  by: item.quantity,
  where: { productId, gender, size, color },
  transaction,
});
```

## Optional authentication

Some routes work for guests but enrich the result when a token is present —
checkout is the example. Verify inside a try and swallow the failure
deliberately:

```js
let userId = null;
const authHeader = req.headers["authorization"];
const token = authHeader?.split(" ")[1];
if (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    // Guest order — no userId
  }
}
```

That empty catch is acceptable precisely because the comment states the intent.

## Constants

Shared values live in `backend/constants/constants.js`, `UPPER_SNAKE_CASE`,
grouped under a section banner:

```js
// ==================== ORDER ====================

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const DEFAULT_ORDER_PAGE_SIZE = 20;
```

Existing groups: `ORDER`, `RECOMMENDATIONS`, `OAUTH`. Do not inline a magic
number, and do not repeat a string literal that already has a constant —
`TOKEN_SCOPES`, `AUTH_PROVIDERS`, `ORDER_STATUSES`, `JWT_TTL`,
`PENDING_TOKEN_TTL`, `HANDOFF_TTL_MS`, `OAUTH_ERROR_CODES`.

## Environment variables

Adding one is three edits, all required:

1. `backend/utils/env.js` — add to the required list, so boot fails fast
2. `backend/.env.example` — add with a placeholder, never a real secret
3. The code that reads it

`index.js` calls `getMissingEnvVars(process.env)` at startup and exits on a
missing variable. Keep that behaviour: a server that boots without its secrets
fails later, in production, instead of immediately, on your machine.

## Codebase gotchas

- **Webhook before the body parser.** `app.use("/api/orders/webhook", stripeWebhook)`
  sits above `app.use(bodyParser.json())` in `index.js` because Stripe
  signature verification needs the raw body. Moving it breaks payments silently.
- **`sequelize.sync({ force: false })` runs only outside production.** It is a
  dev convenience, not a migration path. Schema changes still need a real
  migration.
- **The unhandled-error middleware** at the bottom of `index.js` logs
  `req.method` + `req.originalUrl` and maps Multer errors to 413/400. Let errors
  reach it rather than swallowing them locally.
- **`express-session` is mounted only on `/auth/google`**, with a 5-minute
  cookie, because it exists purely for the OAuth handshake. Do not widen it to
  the whole app.
