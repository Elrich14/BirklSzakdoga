# CLAUDE.md — Kerian E-Commerce Project

## Project Overview

**Kerian** is a full-stack e-commerce clothing store (Birkl brand) built as a university thesis project ("Szakdoga"). It features product browsing, filtering, wishlist management, shopping cart, checkout with email confirmation, and JWT-based authentication.

---

## Technology Stack

### Frontend (`frontend/kerian/`)
- **Framework:** Next.js 15.5.4 (App Router, Turbopack)
- **Language:** TypeScript 5 (strict mode)
- **UI Library:** Material-UI (MUI) v7 + Emotion styled components
- **State Management:** Zustand (cart), React Query / TanStack Query (server state), Context API (language)
- **Forms:** Formik + Yup validation
- **i18n:** i18next + react-i18next (English & Hungarian)
- **Auth:** JWT (jwt-decode, stored in localStorage)
- **Styling:** Emotion `styled()` components (primary), Tailwind CSS (utility), MUI theme
- **Dev Server:** Port 3001

### Backend (`backend/`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (CommonJS)
- **ORM:** Sequelize v6
- **Database:** PostgreSQL 15
- **Auth:** jsonwebtoken + bcryptjs
- **Email:** Nodemailer (Gmail SMTP)
- **Dev:** Nodemon (auto-restart)
- **Port:** 3000

### Infrastructure
- **Containerization:** Docker Compose (PostgreSQL, backend, frontend)
- **Database name:** `kerian`

---

## Before Making Changes — Always Ask

1. **Before creating a new file:** Does this belong in an existing file? Can I extend an existing component?
2. **Before adding a dependency:** Is there already a dependency that covers this? Check `package.json` first.
3. **Before deleting anything:** Always ask the user for confirmation.
4. **Before refactoring:** Only refactor what was explicitly requested. Do not "improve" surrounding code.
5. **Before adding a new page/route:** Confirm the route name and where it fits in the navigation.
6. **Before adding an API endpoint:** Put it in the right backend file — `auth.js`, `productRoutes.js`, `wishlistRoutes.js`, `orderRoutes.js`, `reviewRoutes.js`, or `adminRoutes.js` — and add the typed client function to `frontend/kerian/api.ts`. Don't create a new backend route file for a single endpoint, and don't scatter `fetch()` calls through components.

---

## Git operations — NEVER do these

The user does **all** git/GitHub operations manually. This is non-negotiable, even if the user seems to ask for it (e.g. "ship this" or "make a PR"). Confirm what they want done locally and stop at uncommitted changes.

- **NEVER** run `git commit` (or `git commit --amend`) for any reason
- **NEVER** run `git push` (or any variant: `--force`, `--force-with-lease`, `-u`, etc.)
- **NEVER** create pull requests via `gh pr create` or any other means
- **NEVER** add `Co-Authored-By: Claude` (or any other Claude attribution) to commit messages — the user does not want Claude attributed in their git history or GitHub UI
- **NEVER** run rebase, cherry-pick, reset --hard, or other history-rewriting commands without explicit, scoped permission for that single operation

What you **may** do:
- Read-only git commands (`git status`, `git log`, `git diff`, `git branch`, `gh pr view`, `gh issue list`)
- `git add`/`git rm` only when the user is staging for a commit they will run themselves and explicitly asks
- Suggest a commit message or PR title/body for the user to use, but never execute

If the user asks to commit/push/PR, remind them of this rule and offer to draft the message/body for them to run manually.

---

## Clean Coding Rules

### Naming Conventions

| What | Convention | Examples |
|------|-----------|----------|
| Functions | camelCase, action verbs, **NO `handle` prefix** | `onSubmit`, `createUser`, `fetchData` |
| Variables | camelCase, descriptive, no single letters | `userEmail`, `cartItems`, `filteredProducts` |
| Booleans | Prefix with `is`, `has`, `should` | `isActive`, `hasPermission`, `shouldUpdate` |
| Components | PascalCase with type suffix | `ProductCard`, `AuthProvider`, `UserList` |
| Files | camelCase for files | `authProvider.ts`, `productCard.tsx` |
| Constants | UPPER_SNAKE_CASE | `PRODUCT_SIZES`, `AVAILABLE_COLORS` |
| CSS classes | `${PREFIX}-descriptiveName` | `ProductCard-root`, `Navbar-leftBox` |
| Translation keys | Nested dot notation | `"navbar.home"`, `"card.addToCart"` |
| Hooks | `useX` pattern | `useCartStore`, `useLanguage` |

### Event Handlers — Important!
- **NEVER** use `handle` prefix: ~~`handleSubmit`~~, ~~`handleClick`~~
- **ALWAYS** use `on` prefix: `onSubmit`, `onClick`, `onChange`

### TypeScript Rules
- **Avoid `any`** — always type explicitly
- **Interfaces** for object shapes, **types** for unions/intersections
- Props types defined as `interface Props { ... }`
- Use type guards over type assertions

### Variable Naming — No Short Abbreviations
- **NEVER** use 1-2-3 letter variable names: ~~`v`~~, ~~`s`~~, ~~`c`~~, ~~`col`~~, ~~`val`~~, ~~`img`~~, ~~`e`~~
- **ALWAYS** use descriptive names: `variant`, `sizeOption`, `colorOption`, `parsedValue`, `image`, `event`
- In `.reduce()` callbacks: ~~`sTotal`~~, ~~`cTotal`~~ → `sizeTotal`, `colorTotal`
- In `.filter()` callbacks: ~~`(_, i)`~~ → `(_, currentIndex)`
- Standard hooks (`t` from `useTranslation`) are fine — this rule applies to user-defined variables

### Error Handling — Fix, Never Hide
- **NEVER** use `eslint-disable` comments — fix the root cause instead
- **NEVER** suppress or hide warnings/errors — every problem must be properly solved
- **NEVER** use `@ts-ignore` or `@ts-expect-error` as a workaround
- If ESLint warns about `<img>`, use `next/image` properly — don't disable the rule
- Empty `catch {}` blocks are acceptable only when the catch is intentional AND has a comment explaining why (e.g., parsing optional JSON)

---

## Component File Structure (Frontend)

Every React component should follow this exact order:

```tsx
"use client";

// 1. External imports
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";

// 2. Internal imports (components, store, utils, constants)
import { useCartStore } from "../components/store/cartStore";
import { colors } from "@/constants/colors";

// 3. Types/Interfaces
interface Props {
  title: string;
  onAction: () => void;
}

// 4. Styled components (PREFIX + classes pattern)
const PREFIX = "ComponentName";
const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: { /* styles */ },
  [`& .${classes.content}`]: { /* styles */ },
}));

// 5. Component definition
export default function ComponentName({ title, onAction }: Props) {
  // 5a. Hooks (queries, state, translation, etc.)
  const { t } = useTranslation();
  const [state, setState] = useState();

  // 5b. Derived/computed state
  const computedValue = useMemo(() => { /* ... */ }, []);

  // 5c. Event handlers (use `on` prefix!)
  const onSubmit = () => { /* ... */ };

  // 5d. Helper functions
  const formatData = () => { /* ... */ };

  // 5e. Render
  return (
    <Root className={classes.root}>
      {/* JSX */}
    </Root>
  );
}
```

---

## Styling Rules

### Preferred: MUI `styled()` Components
```tsx
// GOOD — styled component with theme
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}));
```

### NEVER Use Inline `sx`, `style`, or `secondaryTypographyProps.style`
**All styles MUST go through styled components with the PREFIX + classes pattern.** No exceptions.
```tsx
// BAD — inline sx prop
<Box sx={{ padding: 2, margin: 1 }}>

// BAD — inline style prop
<div style={{ padding: '16px' }}>

// BAD — inline style via props
<ListItemText secondaryTypographyProps={{ style: { overflow: "hidden" } }} />

// GOOD — use a class from the styled component
<ListItemText secondaryTypographyProps={{ className: classes.description }} />
```

### CSS Values — Always Use String Units
**Never use bare numbers for CSS values.** Always include the unit as a string so it's clear what unit is being used.
```tsx
// BAD — unclear what unit
marginLeft: 10,
fontSize: 30,
maxWidth: 1300,

// GOOD — explicit units
marginLeft: "10px",
fontSize: "30px",
maxWidth: "1300px",
```
The only exception is `0` (which needs no unit) and `opacity`/`zIndex`/`flexGrow` (which are unitless by spec).

### Theme Colors
- Use theme variables and `colors` constant from `@/constants/colors`
- Primary brand color: `#039c82` (kerian_main)
- Dark mode theme (background: `#000000`, paper: `#111111`)
- Never use `!important` unless absolutely necessary

---

## State Management Layers

| Layer | Tool | Use For |
|-------|------|---------|
| Local UI state | `useState` | Dialogs, form inputs, toggles |
| Complex local state | `useReducer` | Multi-field forms, complex logic |
| Cart (global) | Zustand (`useCartStore`) | Cart items, quantities |
| Server data | React Query (`useQuery`) | Products, wishlist, API data |
| Language | Context (`useLanguage`) | i18n language switching |

---

## API Patterns

### API Organization
- **Backend:** routes are split by domain into `auth.js`, `productRoutes.js`, `wishlistRoutes.js`, `orderRoutes.js`, `reviewRoutes.js`, and `adminRoutes.js`. Each file exports an `express.Router()`. `index.js` is a thin bootstrap that mounts them at their URL prefixes (`/auth`, `/api/products`, `/api/wishlist`, `/api`, `/api/reviews`, `/api/admin`). Shared middleware (`authenticateToken`, `requireAdmin`), DB setup (`dataBase.js`), models (`models/`), and helpers (`orderEmail.js`, `upload.js`) stay in their own files.
- **Frontend:** every typed client function lives in a single file — `frontend/kerian/api.ts`. No scattered `fetch()` calls in components, pages, or providers. When you need to call the backend, add a typed function to `api.ts` and import it.
- **When adding a new endpoint:** add the route to the matching backend file AND add the typed client function to `api.ts`. Keep the two sides in sync.

### Frontend API Client (`frontend/kerian/api.ts`)
- Base URL: `process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"`
- Auth: Bearer token from `localStorage.getItem("token")`
- All endpoints typed with request/response interfaces

### Backend Route Patterns
- Protected routes use `authenticateToken` middleware
- Error responses: `{ error: "descriptive message" }`
- Status codes: 200 (OK), 201 (Created), 204 (Deleted), 400/401/403/404/500

---

## Internationalization (i18n)

- Languages: English (`en`), Hungarian (`hu`)
- Files: `locales/{en,hu}/translation.json`
- Access: `const { t } = useTranslation();` then `t("section.key")`
- Sections: `common`, `navbar`, `login`, `register`, `filter`, `card`, `products`, `wishlist`, `cart`, `orderingForm`, `feedback`
- **When adding user-visible text:** Always use translation keys, never hardcode strings
- **When adding a new key:** Add to BOTH `en` and `hu` translation files

---

## Project Structure

```
BirklSzakdoga/
├── backend/
│   ├── index.js              # Express server bootstrap — mounts route modules
│   ├── auth.js               # /auth/* routes (login, register)
│   ├── productRoutes.js      # /api/products/* routes
│   ├── wishlistRoutes.js     # /api/wishlist/* routes
│   ├── orderRoutes.js        # /api/orderEmail + /api/orders/* routes
│   ├── reviewRoutes.js       # /api/reviews/* routes
│   ├── adminRoutes.js        # /api/admin/* routes
│   ├── authenticateToken.js  # JWT middleware
│   ├── requireAdmin.js       # Admin-only middleware
│   ├── orderEmail.js         # Nodemailer email service
│   ├── upload.js             # Multer upload helper
│   ├── dataBase.js           # Sequelize initialization
│   ├── models/               # Sequelize models (user, products, wishlist, etc.)
│   ├── migrations/           # DB schema migrations
│   ├── seeders/              # Data seeders
│   └── constants/            # Shared constants
├── frontend/kerian/
│   ├── app/
│   │   ├── layout.tsx        # Root layout (theme, providers, navbar)
│   │   ├── page.tsx          # Home page
│   │   ├── products/         # Products listing + filtering
│   │   ├── cart/             # Shopping cart
│   │   ├── wishlist/         # User wishlist
│   │   ├── login/            # Login form
│   │   ├── register/         # Register form
│   │   ├── logout/           # Logout + inactivity
│   │   ├── order/            # Checkout/order page
│   │   ├── components/       # Shared components
│   │   │   ├── navbar/
│   │   │   ├── filtering/    # Product filter components
│   │   │   └── store/        # Zustand cart store
│   │   ├── providers/        # Context providers
│   │   └── utils/            # Auth utilities
│   ├── constants/            # Colors, filter constants, validation
│   ├── locales/              # i18n translation files
│   ├── api.ts                # Typed API client — all endpoints in one file
│   ├── theme.ts              # MUI dark theme
│   └── i18n.ts               # i18next configuration
├── docker-compose.yml
├── code-style-guide.md       # Detailed coding conventions
├── .eslintrc.js
└── .prettierrc
```

---

## Formatting & Linting

- **Prettier:** printWidth 80, tabWidth 2, spaces (no tabs), semicolons, trailing commas (es5), bracket spacing, arrow parens always
- **ESLint:** eslint:recommended + react + prettier plugin
- Always format code according to these rules

---

## Git Conventions

- **Commit format:** Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- **Branch:** `main` is the primary branch
- **Case sensitivity warning:** macOS is case-insensitive, Windows cares about case in imports. Always ensure git tracks the correct casing for files and folders.

---

## Key Domain Knowledge

- **Cart identity:** Items in cart are uniquely identified by `productId + gender + size + color` combination
- **Product variants:** Products have arrays of colors, sizes, and genders (not single values)
- **User roles:** `"admin"`, `"user"`, `"guest"` (guest = not logged in)
- **Auth flow:** Login → JWT token → localStorage → Bearer header on protected requests
- **Wishlist:** Only available for logged-in users
- **Inactivity:** Auto-logout on user inactivity (InactivityHelper component)

---

## Known security gaps (deliberately deferred, tracked)

These gaps exist in the current implementation and are tracked for future work. They were accepted as scope-outs during the Google OAuth rollout (issue #39, 2026-04-19) so the feature could ship on schedule. Do not silently re-introduce or "fix" these in unrelated PRs — each one has its own issue.

- **JWT stored in `localStorage`** → vulnerable to XSS token theft. Migration to `httpOnly` cookies is tracked in **#50**. This is the single biggest real security upgrade — favor it over the other items when scheduling.
- **In-memory OAuth handoff store** (`backend/oauth/handoffStore.js`) → works only on a single backend instance; a multi-instance deploy would break Google sign-in. Redis migration tracked in **#51**.
- **No email verification on password registration** → a user can register with an email they don't own. Tracked in **#52**. Google sign-in *does* require `email_verified:true` from Google, so OAuth users are safe.
- **No "link Google to existing account" UI on the profile page** → today, email-password users who try to sign in with the same Google email hit the `oauthEmailInUse` snackbar. Tracked in **#53**.
- **No device/session management** → users can't see or revoke active sessions. Tracked in **#54**.
- **Admin promotion of password-less Google users** → a Google-only account (`authProvider: "google"`, `password: null`) could theoretically be promoted to admin and then be unable to complete the admin login flow (which requires password + TOTP). Promotion path should refuse Google-only users. Tracked in **#55**.

Umbrella roadmap issue: search GitHub for "OAuth hardening roadmap".
