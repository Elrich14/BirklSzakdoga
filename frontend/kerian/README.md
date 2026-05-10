# Kerian frontend

Next.js 15 (App Router, TypeScript, MUI v7) frontend a Kerian webshophoz.

A teljes szakdolgozati README — futtatás, környezeti változók, demo
felhasználók, ismert korlátok, bíráláshoz tartozó információk — a repó
gyökerében található.

- [`../../README.md`](../../README.md) (magyar)
- [`../../README.en.md`](../../README.en.md) (angol)

## Frontend-specifikus tudnivalók

```bash
npm install
npm run dev      # Next.js dev server, port 3001 (Turbopack)
npm run build    # produkciós build
npm run lint     # ESLint
```

Környezeti változók: másold le a [`.env.example`](.env.example) fájlt
`.env.local` néven és töltsd ki.

A projekt-specifikus kódolási konvenciókat (nevezési, MUI styled-components,
i18n szabályok) a repó gyökerében lévő [`CLAUDE.md`](../../CLAUDE.md)
tartalmazza.
