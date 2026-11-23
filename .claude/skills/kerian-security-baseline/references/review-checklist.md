# Security review pass

For `security-auditor`, or anyone reviewing a diff rather than writing code.
The rules being checked are in `SKILL.md`.

## Scope

```
git diff
git diff --name-only
```

Review what changed and the code it touches. You are not auditing the whole
codebase — every finding must be reachable from this change.

## The ten points, in order

1. New or changed route — is `authenticateToken` present? `requireAdmin` where
   needed, and **after** it?
2. Resource id from path or body — is there an ownership check against
   `req.user.id`?
3. Transaction — does **every** early return roll back first? Check each
   `return` individually, not the block as a whole.
4. Stock or balance read before a write — is there a `lock: transaction.LOCK.UPDATE`?
5. New input field — validated for type, range and enum membership?
6. Webhook handler — is it idempotent against a replayed event?
7. New external call — are failures handled without leaking the error to the
   client?
8. New env var — present in both `utils/env.js` and `.env.example`?
9. Migration — reversible? destructive? Does it match the model change?
10. Any secret, token, hash or recovery code reaching a log line?

Then: does the diff touch a tracked gap (#50–#55), and is that named in the
report?

## What counts as a finding

You must be able to point at a file and line and describe a concrete failure —
specific inputs or state producing a specific wrong outcome.

Not a finding:

> This could be unsafe.

A finding:

> `POST /api/orders/:orderId/cancel` reads `orderId` from the path and never
> compares `order.userId` to `req.user.id` (orderRoutes.js:212), so any
> authenticated user can cancel any order by incrementing the id.

## Report format

Most severe first:

```
<file>:<line>  <one-sentence defect>
  SCENARIO  <concrete inputs/state → wrong outcome>
  FIX       <the smallest change that closes it>
```

Then:

```
STATUS   DONE
WHAT     N findings · <highest severity>
EVIDENCE the commands you ran
NEXT     which agent owns each finding
```

Do not pad the list with style opinions, naming nits or refactoring ideas —
`finalize-change` owns those, and a review diluted with them gets skimmed.

A clean review is a real result. Say so plainly; inventing a finding to look
thorough makes every future review less trusted.
