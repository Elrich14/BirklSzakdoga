# Verification ledger: <slug>

Base commit: <short sha> · Completed: <YYYY-MM-DD HH:MM>

> Filled by the orchestrator, from commands it ran **itself**. An agent's claim
> is never copied in here as evidence. This is the screen the user reads at the
> final gate.

## 1 · Command log

| Command | Exit | Test files that appeared in output |
|---|---|---|
| `npm test` | | |

- Test count at start: <N>
- Test count now: <M>
- New test files present in output: <yes / NO — if no, step 3 was not actually run>

## 2 · Diff coverage

| File | Changed lines | Covered | Uncovered lines + reason |
|---|---|---|---|
| | | | |

- Any changed file **missing from the coverage table**: <none / list>
  (missing = never loaded during the run = zero coverage, not a pass)

## 3 · Red-first evidence

| New test | Failure output captured before the fix? |
|---|---|
| | |

## 4 · Mutation spot check

> Fill the block below **before** applying a mutation, so an interrupted run
> leaves a trail. `status` is `APPLIED` while the code is broken and `RESTORED`
> once it is put back. A run that starts while any block still says `APPLIED`
> must restore that file first.

```
MUTATION IN PROGRESS
  file    <path>
  line    <n>
  from    <exact original line>
  to      <exact mutated line>
  status  APPLIED | RESTORED
```

| File:line | Mutation applied | Result | status |
|---|---|---|---|
| | inverted condition / early return / dropped guard | tests went RED ✓ / stayed GREEN ✗ | RESTORED |

- `git diff -- <file>` shows only the task's intended changes: <yes/no>

> Tests staying green under mutation means the tests are worthless, not that the
> code is good. That is a return to step 3, not a pass.

## Scope check

| Agent | Files changed | Within its boundary? |
|---|---|---|
| | | |

## Skipped

> Everything not run, and why. This section is never empty by omission — write
> "nothing skipped" if that is true.

- ...

## Verdict

- [ ] Command log clean, new tests confirmed to have run
- [ ] Every changed line covered, or the gap named with a reason
- [ ] Every new test was red first
- [ ] Mutation spot check went red and was restored
- [ ] All agents stayed inside their boundaries
- [ ] Security review clean or findings resolved
- [ ] `finalize-change` run, its three commands clean

Nothing is committed or pushed — the user does all git operations.
