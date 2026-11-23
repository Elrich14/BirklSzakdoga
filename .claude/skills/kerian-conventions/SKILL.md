---
name: kerian-conventions
description: Naming and reporting conventions every Kerian agent must follow — English descriptive names for endpoints, functions, variables, fields, migrations and tests, plus the mandatory four-line report format. Load before writing any code or reporting any result in this project.
---

# Kerian conventions

Every agent loads this. There is no exception and no "just this once".

## 1. Every name is English and descriptive

This applies to **everything you name yourself**: endpoints, functions, variables,
database columns, migrations, test names, constants, CSS classes, branch names,
state keys.

No abbreviations. No one-, two- or three-letter names. No Hungarian names in code.

| What | Wrong | Right |
|---|---|---|
| Endpoint | `/api/ord/:id/cxl` | `/api/orders/:orderId/cancel` |
| Function | `calcTot()` | `calculateOrderTotal()` |
| Variable | `const v = ...` | `const selectedVariant = ...` |
| Loop item | `for (const i of items)` | `for (const orderItem of orderItems)` |
| Reduce accumulator | `(s, c) => s + c` | `(runningTotal, orderItem) => ...` |
| Field | `qty`, `amt` | `quantity`, `amountInCents` |
| Boolean | `flag`, `ok` | `isCancellable`, `hasRemainingStock` |
| Migration | `fix-orders` | `add-cancelled-at-to-orders` |
| Test | `test("works")` | `test("rejects cancellation of a shipped order")` |
| Constant | `MAX` | `MAX_RECOVERY_CODE_ATTEMPTS` |

### Framework idioms that stay

The existing codebase uses these and you keep them — the rule is about names
**you** invent, not about rewriting the framework's vocabulary:

- Express: `req`, `res`, `next`, `err` in middleware signatures
- `t` from `useTranslation()`
- `id` as a primary-key field name

### Endpoint naming

- Plural resource nouns: `/api/orders`, `/api/products`, `/api/reviews`
- The verb lives in the HTTP method, not the path — `DELETE /api/wishlist/:productId`,
  not `POST /api/wishlist/deleteItem`
- A non-CRUD action is a named sub-path: `/api/orders/:orderId/cancel`
- Path params are named: `:orderId`, `:productId` — never bare `:id` on a nested route

### Event handlers (frontend)

`on` prefix, never `handle`. `onSubmit`, `onColorChange`, `onDialogClose`.

## 2. How you report

Short, concrete, unambiguous. No preamble, no closing summary, no narration of
what you tried. Exactly four fields:

```
STATUS   DONE | BLOCKED | NEEDS-DECISION
WHAT     one sentence on what is now true
EVIDENCE the command you ran and its raw output
NEXT     one sentence — or the question with its options named
```

### Rules for each field

- **STATUS** — `DONE` only if you ran something that proves it. `BLOCKED` means you
  cannot proceed without a change outside your scope. `NEEDS-DECISION` means two
  valid paths exist and picking wrong would be expensive.
- **WHAT** — what is true now, not what you attempted.
- **EVIDENCE** — raw output, trimmed to the relevant lines. "Tests pass" is not
  evidence. The test runner's own output is. If you changed files, list them with
  `git diff --name-only`.
- **NEXT** — when you ask a question you **must name the options**. "How should I
  do this?" is forbidden. "A: store the cancellation reason on the order. B: a
  separate audit table. A is simpler and matches the existing schema — recommend A."
  is the expected form.

### Forbidden in reports

- "I apologize", "Let me explain", "Great question"
- Summarising what you already said
- Claiming success you did not verify
- Silently dropping part of the task — if you skipped something, it goes in `WHAT`

## 3. Read what you need, not whole files

You start with a fresh context every time you are dispatched, so what you read
is most of what your run costs. These files are big enough that reading one
whole is a measurable waste:

| File | Lines |
|---|---|
| `frontend/kerian/app/admin/components/twoFactorSettings.tsx` | 1015 |
| `frontend/kerian/api.ts` | 921 |
| `backend/adminRoutes.js` | 597 |
| `frontend/kerian/app/admin/components/productForm.tsx` | 578 |
| `frontend/kerian/app/admin/components/orderManagement.tsx` | 564 |

Locate first, then read the part you need:

```
Grep "export async function cancelOrder" frontend/kerian/api.ts
Read frontend/kerian/api.ts offset=640 limit=80
```

`api.ts` is organised under `// ==================== SECTION ====================`
banners — grep for the banner to find your section's line number, then read that
range.

Read a file in full when it is genuinely small (under ~150 lines), when you are
about to rewrite it, or when `finalize-change` asks for a full re-read. Otherwise
grep, then read the range.

This is about cost, not thoroughness: never skip reading something you need in
order to be correct. A wrong change is far more expensive than a large read.

## 4. Comments

Match the surrounding file's comment density. The existing code comments **why**,
not what. An empty `catch {}` needs a one-line reason (the codebase already does
this, e.g. `// Guest order — no userId`).

Section banners in long files follow the existing style:

```js
// ==================== ORDER ====================
```
