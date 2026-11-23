---
name: kerian-testing
description: How to write and run tests in the Kerian project — node:test style, the adversarial attack checklist, coverage measurement, and the red-first evidence requirement. Load before writing or running any test.
---

# Kerian testing

The job is not to show the code works. The job is to **attack the assumptions the
code makes**. A test suite that only walks the happy path is worth roughly
nothing, and it costs real time to maintain.

## Runner and style

Backend uses Node's built-in runner — no framework, no new dependency.

```js
const { test } = require("node:test");
const assert = require("node:assert");
const { calculateOrderTotal } = require("../utils/orderPricing");

test("rejects a fractional quantity", () => {
  assert.throws(() => calculateOrderTotal([{ quantity: 1.5, priceHuf: 100 }]));
});
```

Rules:

- Test files live in `backend/test/`, named `<unitUnderTest>.test.js`
- `assert.strictEqual` / `deepStrictEqual`, not `==`
- **The test name is a sentence about behaviour.** `test("works")` is useless;
  `test("rejects cancellation of a shipped order")` tells you what broke when it
  fails.
- One behaviour per test. A test asserting five unrelated things reports one
  failure for five possible causes.
- No network, no real Stripe, no real email. Inject or stub the boundary.

Run:

```
cd backend && npm test
cd backend && node --test --experimental-test-coverage
```

The frontend has **no test runner configured** (`package.json` has only `dev`,
`build`, `start`, `lint`). Do not invent one silently. If frontend tests are
needed, report `NEEDS-DECISION` naming the options.

## Testability

If a rule is buried inside a route handler, it cannot be unit tested without
spinning up Express and Postgres. Extract it into `backend/utils/` as a pure
function and test that — this is the pattern the codebase already uses
(`utils/authHelpers.js`, `utils/env.js`, `utils/dbSsl.js` all have tests).

Extracting for testability is allowed and encouraged. Rewriting unrelated code
is not.

## The attack checklist

Work through every row that the change touches. For each, either write the test
or state in your report why it does not apply.

| Area | Attacks |
|---|---|
| **Auth** | Expired token · token signed with the wrong secret · `alg: none` · missing `Authorization` header · malformed `Bearer` · a `2fa-pending` / `google-pending` scoped token used as a session token · admin route hit with a normal user token |
| **Authorization (IDOR)** | Another user's order id · another user's wishlist item · another user's review · a deleted resource's id · a negative or non-numeric id |
| **Orders** | `quantity` of `0`, `-1`, `1.5`, `Number.MAX_SAFE_INTEGER` · a variant that does not exist · stock exactly equal to the request · **two concurrent orders for the last item** · an empty cart · a cart item whose price was altered in the request body |
| **Stripe** | The same webhook event delivered twice · an invalid signature · a missing signature header · an event for an order that no longer exists · a currency not in `SUPPORTED_CURRENCIES` |
| **2FA** | Brute-forcing the TOTP · reusing a recovery code · a recovery code belonging to another user · rate limiter bypass by changing case or whitespace |
| **OAuth** | `email_verified: false` from Google · a Google email that already exists as a password account · a reused or missing `state` · an expired handoff entry |
| **Input** | SQL-ish strings in product filters · an enum value not in the constant · a string where a number is expected · `null` and `undefined` for every required field · a very long string in a `STRING` column |
| **Upload** | A file over the size limit · a non-image MIME type · an image with a script payload in the filename |
| **State transitions** | Cancelling an already-cancelled order · shipping a cancelled order · any transition not in `ORDER_STATUSES` order |

Concurrency is the one people skip, and it is the one that costs money here.
Test it by driving the two paths with `Promise.all` against a real transaction,
or by asserting the lock is requested.

## Red before green

**You must see each new test fail before the code that satisfies it exists.**

Order of work:

1. Write the test
2. Run it — capture the failure output
3. Write or fix the code
4. Run it — capture the pass output

Both outputs go in your report. A test that was never red has not been shown to
test anything; it may be asserting a tautology.

If you are writing a test for code that already exists, make it red by
temporarily breaking the code, capture that, then restore.

## Coverage

```
cd backend && node --test --experimental-test-coverage
```

The report ends with a per-file table including an **uncovered lines** column.

Two things to understand about it:

- A file that was never loaded during the run **does not appear in the table at
  all**. Absent means zero, not fine.
- Total project coverage is not the goal. The question is always: *are the lines
  this change touched covered?*

Report coverage as "changed lines covered / changed lines total" per file, and
name every uncovered changed line with a reason.

## Your report

```
STATUS   DONE
WHAT     5 tests added for order cancellation; 2 pre-existing bugs found.
EVIDENCE
  RED:  <failure output, trimmed>
  GREEN: <pass output, trimmed>
  COVERAGE: orderRoutes.js 42/42 · utils/orderPricing.js 16/18
            uncovered: 91, 92 (Stripe network failure branch)
NEXT     Two findings for backend-engineer: <file:line> <one line each>
```

You report failures. You do **not** fix production code — that is
`backend-engineer`'s job, and keeping the roles apart is what stops a bug and
its test from being written to agree with each other.
