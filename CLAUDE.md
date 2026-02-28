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

### Avoid: Inline `sx` and `style` Props
```tsx
// BAD — inline sx prop
<Box sx={{ padding: 2, margin: 1 }}>

// BAD — inline style prop
<div style={{ padding: '16px' }}>
```

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
│   ├── index.js              # Express server + all routes
│   ├── auth.js               # Login/register routes
│   ├── authenticateToken.js  # JWT middleware
│   ├── orderEmail.js         # Nodemailer email service
│   ├── dataBase.js           # Sequelize initialization
│   ├── models/               # Sequelize models (user, products, wishlist)
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
│   ├── api.ts                # API client with all endpoints
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
