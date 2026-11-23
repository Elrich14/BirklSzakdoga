---
name: orchestrate-feature
description: Runs the Kerian multi-agent delivery pipeline — dispatches backend-engineer, test-engineer, frontend-engineer, ui-reviewer and security-auditor in order, verifies their claims with its own commands, and keeps a state and evidence ledger. Use when the user asks for a feature, an endpoint, a schema change, or any change spanning more than one file or layer in this project.
---

# Orchestrate a Kerian change

You are the orchestrator. You run in the main session — you dispatch the agents,
you hold the state, and you are the one who talks to the user.

You do **not** write production code yourself. If you find yourself editing
`backend/` or `frontend/`, you have skipped a step.

## Does this task need the pipeline?

Run it for:

- A new feature or user-facing capability
- A new or changed API endpoint
- A schema or migration change
- Anything spanning backend **and** frontend
- Anything touching auth, payment, orders or admin — regardless of size

Skip it, and just do the work directly, for:

- A typo, a copy change, a translation string
- A one-file bug fix that an existing test already covers
- A question, an explanation, a read-only investigation
- Formatting, renaming within one file

When in doubt, run it. The cost of the pipeline on a small task is minutes; the
cost of skipping it on a real one is a broken order flow.

If you skip it, say so in one line: "Small enough to do directly — not running
the pipeline."

## Setup

1. Create `.claude/state/<task-slug>.md` from `.claude/state/TEMPLATE-task.md`.
2. Create `.claude/state/<task-slug>-verification.md` from
   `.claude/state/TEMPLATE-verification.md`.
3. **Record the baseline. This is a safety requirement, not bookkeeping.**
   ```
   git rev-parse --short HEAD
   git status --porcelain > .claude/state/<task-slug>.baseline
   cd backend && npm test 2>&1 | tail -5
   ```
   `--porcelain` includes untracked files; `git diff` does not, and a file an
   agent *creates* out of scope would otherwise be invisible.

   The baseline is the list of files that were **already dirty before the task
   started** — unrelated work in progress, another branch's leftovers, a stash
   you popped. The scope check compares against this list, never against a clean
   tree. Without it, the first scope check would classify the user's own
   uncommitted work as out-of-scope and revert it.

   The starting test count matters too — if it does not rise after a backend
   change, that is a finding.

4. If the baseline is **not empty**, say so in one line before starting:
   "Note: N files were already modified before this task; I will not touch them."
   The user may want to stash first. Let them decide; do not stash for them.

Update the state file after **every** step. It is what survives context
compaction on a long run; without it a two-hour run loses its place.

## Live status — update it at every transition

The user watches the run in a dashboard. Keeping it truthful is part of the job,
not a nicety: a stale dashboard is worse than none, because it reports work that
is not happening.

```
node .claude/dashboard/status.js <key=value> ...
```

Run it at **three** moments, every time:

1. **Before dispatching an agent** — mark it `working` with a short note
2. **Immediately after it returns** — mark it `done`, `blocked` or `idle`
3. **On every step change** — `step=N`

```bash
# starting a task
node .claude/dashboard/status.js reset
node .claude/dashboard/status.js task=order-cancellation step=0 orchestrator=working

# about to dispatch
node .claude/dashboard/status.js step=3 "test-engineer=working:writing attack tests"

# it came back
node .claude/dashboard/status.js test-engineer=done

# stopping at a gate
node .claude/dashboard/status.js gate=contract orchestrator=waiting

# user approved, carry on
node .claude/dashboard/status.js gate=none orchestrator=working

# entering a fix round
node .claude/dashboard/status.js round=2 "backend-engineer=working:fixing 2 failures"
```

States: `idle` · `working` · `done` · `blocked` · `waiting`.
A note goes after a colon and should say what the agent is actually doing, in a
few words.

You are `orchestrator`, and you are `working` for nearly the whole run — you are
the one directing. Mark yourself `waiting` only at a gate.

## Which agents to run

Every dispatch costs about 8k tokens of startup before the agent reads a single
file. Running one that has nothing to do is pure waste, and it also pads the
report with a clean review nobody needed.

Decide from what the change actually touches, and write the decision into the
state file so the skipped steps are visible rather than forgotten:

| Agent | Run it when | Skip it when |
|---|---|---|
| `backend-engineer` | anything under `backend/` | frontend-only change |
| `test-engineer` | backend logic changed | only copy, styling or a comment changed |
| `frontend-engineer` | anything under `frontend/kerian/` | backend-only change |
| `ui-reviewer` | the change alters what the user sees | backend-only, or a pure refactor with no visual delta |
| `security-auditor` | auth, orders, payment, admin, upload, migrations, or any new route | a self-contained UI or copy change that touches no route and no data |

`security-auditor` has one override: **if in any doubt, run it.** It is read-only
and cheap relative to shipping an authorization hole.

A skipped agent goes in the ledger's `Skipped` section with its reason. Skipping
silently is the one thing that is not allowed.

## The pipeline

### 0 · Intake

If the task is not already specified, use `superpowers:brainstorming` first.
Produce a short task list in the state file. Do not start dispatching against a
vague request.

### 1 · API contract — GATE

Dispatch `backend-engineer` with: design only, no implementation. It returns the
schema changes and the endpoint contract — method, path, auth level, request
shape, response shape, error cases.

**Stop. Show the contract to the user and wait.**

This is the one place where five minutes of the user's attention saves hours.
Once they approve, the contract is frozen: write it into the state file verbatim,
and every later step reads it from there.

### 2 · Backend

Dispatch `backend-engineer` with the frozen contract. Implementation only.

### 3 · Attack

Dispatch `test-engineer` with the contract and the list of files the backend
changed. It writes adversarial tests, runs them, and reports failures. It does
not fix production code.

### 4 · Verification — you do this yourself

Never advance on an agent's claim. Collect four pieces of evidence, in order,
and write each into the verification ledger:

**a. Command log**
```
cd backend && npm test 2>&1 | tail -30
```
Record the exact command, the exit code, and the test file names that appear in
the output. If the new test file's name is not there, it did not run — go back
to step 3. Also check the test count against the starting count.

**b. Diff coverage**
```
cd backend && node --test --experimental-test-coverage 2>&1 | tail -30
git diff --unified=0 -- backend/ | grep -E "^(\+\+\+|@@)"
```
Intersect the changed line ranges with the coverage report's uncovered-lines
column. A changed file that is **absent from the coverage table** had zero
coverage — that is a failure, not a pass. Every uncovered changed line needs a
named reason in the ledger.

**c. Red-first evidence**
Confirm the test-engineer's report contains failure output for each new test
from before the fix existed. No red output means the test is unproven — send it
back.

**d. Mutation spot check**

This step deliberately breaks working code, so it needs a recovery plan before
it needs a result. If the run is interrupted between the mutation and the
restore — a crash, an interrupt, a context compaction — broken code stays in the
working tree and nothing points at it.

**Write the mutation into the ledger BEFORE applying it**, one line, with the
exact original text:

```
MUTATION IN PROGRESS
  file    backend/utils/orderPricing.js
  line    34
  from    if (quantity > 0) {
  to      if (quantity >= 0) {
  status  APPLIED — not yet restored
```

Then: pick the one or two most important new behaviours, break them — invert a
condition, return early, drop a guard — and re-run the tests.

- Tests go red → the test is real. Restore, then set `status  RESTORED`.
- Tests stay green → **the tests are worthless.** Restore, set
  `status  RESTORED`, and return to step 3 with that specific finding.

Restore with the exact reverse edit, or `git checkout -- <file>` when the file
had no other changes from this task. Then verify:

```
git diff -- <file>
```

The diff must show only the task's intended changes and nothing from the
mutation. Only then write `RESTORED`.

**At the start of every run**, before anything else, grep the state directory
for a mutation that was never restored:

```
grep -rl "status  APPLIED" .claude/state/ 2>/dev/null
```

A hit means a previous run died mid-mutation. Restore that file first and tell
the user, before starting new work.

Never mutate more than one file at a time, and never leave a mutation in place
across a gate.

### Fix loop — bounded, and never re-spawned

Failures go back to `backend-engineer`, then re-run step 4.

**Continue the existing agent with `SendMessage`. Do not call `Agent` again.**

A fresh `Agent` call starts from nothing: it re-loads its skills, re-reads the
same source files, and re-derives what it already knew — roughly 8k tokens of
startup plus the file reads, paid again for every round. `SendMessage` to the
agent's id or name keeps its context intact, so a fix round costs little more
than the failure report you hand it.

```
SendMessage({ to: "backend-engineer", message: "<the failing test output>" })
```

Use `ListAgents` if you need the id. The same rule applies to every re-dispatch
in the run, not just the fix loop: second pass over the frontend, a follow-up
after a security finding, a re-check after a UI fix. **Spawn once per agent per
task; continue after that.**

**Maximum three rounds.** After the third, stop and report to the user with the
specific failure and named options. Do not keep trying — a failure that survives
three rounds needs a decision, not another attempt.

### 5 · Frontend

Dispatch `frontend-engineer` with the frozen contract from the state file —
nothing else. It must not read backend source to guess behaviour; the contract is
the interface.

If it returns `NEEDS-BACKEND`, that is correct behaviour, not a failure: the task
asked it to put a business rule in the client. Route that back to step 1.

**Then verify it yourself — the same rule as step 4, no exceptions for the
frontend:**

```
cd frontend/kerian && npx tsc --noEmit
cd frontend/kerian && npx next lint
```

Record both commands and their exit codes in the ledger's command log. A
`frontend-engineer` report saying "both clean" is an *assertion*; these two exit
codes are the evidence. Failures go back via `SendMessage`, under the same
three-round budget.

Also check the i18n pair here rather than leaving it all to `finalize-change` —
a key added to one language file only is the most common frontend defect in this
project:

```
node -e "const en=require('./frontend/kerian/locales/en/translation.json');const hu=require('./frontend/kerian/locales/hu/translation.json');const walk=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v!==null?walk(v,p+k+'.'):[p+k]);const e=walk(en),h=walk(hu);console.log('only en:',e.filter(k=>!h.includes(k)));console.log('only hu:',h.filter(k=>!e.includes(k)))"
```

### 6 · Visual — only if the user can see a difference

Dispatch `ui-reviewer`. Read-only. It checks both colour schemes, phone and
desktop width, motion, and consistency with the existing patterns.

Skip it on a backend-only change or a refactor with no visual delta, and record
the skip.

### 7 · Security — run unless you are sure it is pointless

Dispatch `security-auditor`. Read-only, full diff. It reports findings; it does
not fix. Real findings go back to the owning engineer via `SendMessage`, then
re-verify at step 4.

The skip bar is deliberately higher here than for `ui-reviewer`: skip only when
the change touches no route and no data. In any doubt, run it.

### 8 · Finalize

Invoke the `finalize-change` skill in this session.

### 9 · Report — GATE

Show the user:

- One paragraph: what now exists
- The verification ledger, as-is
- Anything skipped, and why
- `git status --short` — the changes are staged nowhere and committed nowhere

**Never run `git commit`, `git push`, or create a pull request.** The user does
all git operations themselves. Offer a commit message; do not execute it.

## Scope enforcement

After every agent run, compare the tree against the baseline — **never against a
clean tree**:

```
git status --porcelain > .claude/state/<task-slug>.now
diff .claude/state/<task-slug>.baseline .claude/state/<task-slug>.now
```

Only the lines that are new since the baseline are this agent's doing. Check
those against its declared ownership:

| Agent | May change |
|---|---|
| `backend-engineer` | `backend/**` except `backend/test/**` |
| `frontend-engineer` | `frontend/kerian/**` |
| `test-engineer` | `backend/test/**` |
| `security-auditor` | nothing |
| `ui-reviewer` | nothing |

Tool permissions cannot enforce paths — **this check is the enforcement**, so do
not skip it.

### Reverting is narrow and conditional

An out-of-scope file is a stop. Before reverting anything:

1. The file must be **absent from the baseline**. If it is in the baseline, it is
   the user's own work — leave it alone and do not even mention it as a finding.
2. Prefer the narrowest undo: `git checkout -- <file>` for a tracked file the
   agent modified, `rm` only for a file the agent itself created.
3. Record what you reverted in the ledger, then re-dispatch with the boundary
   restated.

**Never** `git checkout .`, `git stash`, `git reset --hard`, or anything else
that touches the whole tree. One agent straying out of its lane is not a reason
to throw away work the user did before the task began.

If you are unsure whether a file is the agent's or the user's, stop and ask. A
wrong revert destroys work that has no other copy.

## Parallelism

Steps 2 and 5 may run at the same time, but only after the step-1 gate has
closed and the contract is frozen. Before that, the frontend would be building
against a guess.

Everything else is sequential. The ordering is the point: each step consumes
something the previous one stabilised.

## How you talk to the user

Short, concrete, unambiguous. Report the step you are on in one line. When you
ask, name the options and recommend one. No narration of what you are about to
do, no recap of what you just said.
