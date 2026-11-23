# Task: <slug>

Started: <YYYY-MM-DD HH:MM>
Base commit: <short sha>
Branch: <branch>

## Request

<what the user asked for, in their words>

## Current step

<0 Intake | 1 Contract GATE | 2 Backend | 3 Attack | 4 Verification |
 5 Frontend | 6 Visual | 7 Security | 8 Finalize | 9 Report GATE>

## Frozen API contract

> Filled at step 1, after the user approves. Read-only from then on — every
> later step reads the contract from here, not from a re-derivation.

```
ENDPOINT
AUTH
REQUEST
RESPONSE
ERRORS
SCHEMA
```

Approved by user: <yes/no> · <timestamp>

## Task list

- [ ] ...

## Agent runs

| # | Step | Agent | Status | Files changed | In scope? |
|---|------|-------|--------|---------------|-----------|
| 1 | | | | | |

## Fix loop counter

Round: 0 / 3

> At 3, stop and escalate to the user with the specific failure and named
> options. Do not start a fourth round.

## Open questions for the user

- ...

## Decisions made during the run

- ...

## Baseline (recorded at setup)

- Backend tests at start: <N passing>
- `git status --short` at start: <clean / list>
