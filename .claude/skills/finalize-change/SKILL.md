---
name: finalize-change
description: Final cleanup pass over a completed Kerian change — removes dead code and duplication left by multiple agents, checks i18n key pairs and unused dependencies, enforces project conventions, and reads every touched file in full rather than only the diff. Use after implementation and review are done, before handing the change back.
---

# Finalize a Kerian change

The last step before the change goes back to the user. Multi-agent work leaves a
specific kind of mess: two agents solving the same small problem separately,
helpers left behind after a refactor, translation keys added on one side only.
This pass cleans that up.

You may edit. Keep every edit inside the files the change already touched —
this is not a licence to refactor the codebase.

Start with the file list:

```
git diff --name-only
git status --short
```

## 1 · Dead code

- Unused imports (`npx tsc --noEmit` and `npx next lint` catch most on the frontend)
- Helper functions no longer called by anything
- Commented-out code left from an earlier attempt
- Temporary logging, scratch variables, debug `console.log`
- Mutation-test damage — a condition that was inverted and not restored.
  Read every changed line of logic and confirm it says what it should.

## 2 · Duplication between agents

The characteristic multi-agent artefact. Look for:

- The same formatting, parsing or calculation written in both `backend/utils/`
  and a frontend component
- Two near-identical styled components created for one UI change
- A constant defined twice — once in `backend/constants/constants.js`, once in
  `frontend/kerian/constants/`

A value the server computes is not recomputed on the client. If both sides
genuinely need it, the server sends it.

## 3 · i18n

```
node -e "const en=require('./frontend/kerian/locales/en/translation.json');const hu=require('./frontend/kerian/locales/hu/translation.json');const walk=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v!==null?walk(v,p+k+'.'):[p+k]);const enKeys=walk(en),huKeys=walk(hu);console.log('only in en:',enKeys.filter(k=>!huKeys.includes(k)));console.log('only in hu:',huKeys.filter(k=>!enKeys.includes(k)));"
```

Both lists must be empty. Then check for orphans: a key added during this change
that nothing references.

Any user-visible string still hardcoded in a component is a finding — including
`aria-label`s, placeholders and snackbar text.

## 4 · Unused dependencies and columns

For every package added during this change, confirm something imports it.

There is already standing work here: `@apollo/server`, `graphql`, `graphql-http`
and `graphql-tools` are in `backend/package.json` and **no backend file imports
any of them**. Verify before acting:

```
cd backend && grep -rl "apollo\|graphql" --include="*.js" . | grep -v node_modules
```

If that returns nothing, report it as a recommended removal. Do **not** remove
them as part of an unrelated change — tell the user, let them decide.

Same for a database column added and then not used by any model or route.

## 5 · Conventions

Scan the changed files against the project rules:

```
grep -rn "sx={{" frontend/kerian/app
grep -rn "const handle\|handleClick\|handleSubmit" frontend/kerian/app
grep -rn ": any\|@ts-ignore\|@ts-expect-error\|eslint-disable" frontend/kerian/app frontend/kerian/api.ts
```

Also by eye, because grep cannot see these:

- Bare numbers as CSS values (`padding: 16` instead of `"16px"`)
- Raw hex colours instead of `theme.vars?.palette.*`
- Abbreviated or non-English names — `v`, `qty`, `tmp`, `adatok`
- An `error` response that is neither a sentence nor a translation key
- An early return inside a transaction that does not roll back first

## 6 · Read the files, not the diff

For each changed file, read it **end to end**.

The diff shows what changed; it cannot show that the change sits badly in its
surroundings. This is where you catch: a function added at the bottom when the
file groups by domain, a second way of doing something the file already does
above, a new section that breaks the file's existing banner structure, a
component that now does two unrelated jobs and should be split.

Large files deserve extra attention. `twoFactorSettings.tsx` is over 1000 lines;
if this change added to it, say so.

## Verify, then report

```
cd backend && npm test
cd frontend/kerian && npx tsc --noEmit
cd frontend/kerian && npx next lint
```

All three clean. Their raw output is your evidence.

```
STATUS   DONE
WHAT     <what was removed or fixed, in one sentence>
EVIDENCE <the three command outputs, trimmed>
NEXT     <recommendations you did NOT apply, each one line with a reason>
```

Things you deliberately left alone go under `NEXT`. Silently fixing something
outside this change's scope is exactly the behaviour this project does not want —
name it and let the user decide.
