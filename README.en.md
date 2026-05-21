# Kerian webshop — Thesis repository

> Magyar változat: [`README.md`](README.md)

A full-stack clothing webshop. This repository contains the complete
source code of the practical part of the thesis: customer-facing
storefront, admin panel, REST backend, database migrations and seed data,
plus the built-in Claude-based product recommender.

The thesis text is in the [`docs/`](docs/) folder
(`Birkl Erik András szakdolgozat.docx`).

## Features

Customer side:

- sign-up and sign-in (e-mail and password, or Google OAuth)
- real-time (debounced) product search
- filtering by size, color, gender, price
- variant-aware cart (size, color, gender combinations)
- per-user cart persistence
- wishlist for signed-in users
- checkout with shipping and billing address
- card payment via Stripe Checkout
- order status tracking
- product reviews and 5-star ratings after delivered orders
- AI-based product recommender (Claude Haiku 4.5) on the cart page:
  suggests items that match the cart in style, color and occasion, and
  never recommends a product that is already in the cart
- Hungarian/English language switch and dark/light theme toggle
- auto-logout after 30 minutes of inactivity

Admin side:

- login gated by mandatory TOTP two-factor authentication (2FA)
- product CRUD with image upload
- per-variant stock management
- order list and status transitions
  (pending, paid, shipped, delivered, cancelled)
- analytics dashboard: revenue, order count, time-series trends
- review moderation

## Tech stack

Frontend: Next.js 15 (App Router, Turbopack), TypeScript, Material-UI v7
and Emotion, Zustand for cart state, TanStack Query for server data,
Formik and Yup for forms, i18next for localization.

Backend: Node.js, Express.js, Sequelize v6, Passport.js for Google OAuth,
otplib for TOTP, Nodemailer for e-mail, Multer for file uploads.

Database: PostgreSQL 15. Locally via Docker Compose, in production via
Supabase managed Postgres.

External services: Cloudinary for image hosting, Stripe for payments,
Google OAuth, Anthropic Claude for the AI recommender, Gmail SMTP for
order confirmation emails.

Containerization: Docker Compose with frontend, backend, and postgres
services.

The rationale behind each technology choice is detailed in chapter 2 of
the thesis.

## Architecture

A standard three-tier architecture. The presentation layer is the Next.js
frontend on port 3001 with MUI components, a Zustand-backed cart, and
React Query for server state. The application layer is the Express backend
on port 3000 with JWT-based authentication and routes split by domain
(`auth.js`, `productRoutes.js`, `orderRoutes.js`, `wishlistRoutes.js`,
`reviewRoutes.js`, `adminRoutes.js`, `twoFactorRoutes.js`,
`recommendationsRoutes.js`). The data layer is PostgreSQL via Sequelize
ORM, hosted on Supabase.

Order placement uses pessimistic locking (Sequelize transaction with
`LOCK.UPDATE`) to ensure stock cannot go negative under concurrent
purchases.

## Local setup

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- a free Supabase project, or alternatively the local Postgres shipped in
  the Docker Compose stack
- optionally, your own credentials for the other external services (see
  the environment variables section)

### Database: Supabase (recommended)

The application targets Supabase managed Postgres as its primary database,
and review runs are expected to use Supabase as well. The following steps
work with a free Supabase account.

1. Create a new project at https://supabase.com.
2. In Project Settings → Database, copy the connection string and fill in
   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in
   `backend/.env`. The `DB_HOST` must contain "supabase" — both the
   backend runtime and the Sequelize CLI auto-enable SSL based on this.
3. Migrations and seeds run against your own Supabase database (see the
   commands below).

### With Docker Compose

```bash
git clone https://github.com/Elrich14/BirklSzakdoga.git
cd BirklSzakdoga

cp backend/.env.example backend/.env
cp frontend/kerian/.env.example frontend/kerian/.env.local
# edit both files — at minimum the Supabase DB and JWT settings are required

docker compose up --build
```

The frontend is then available at http://localhost:3001, the backend at
http://localhost:3000.

To create the schema and seed the demo users, run migrations and seeders
in the backend container once:

```bash
docker compose exec backend npx sequelize-cli db:migrate
docker compose exec backend npx sequelize-cli db:seed:all
```

When `package.json` changes, the named `node_modules` volume needs to be
removed so the new dependencies install cleanly:

```bash
docker compose down
docker volume rm birklszakdoga_backend_node_modules
docker compose up --build
```

The `db` service in `docker-compose.yml` is a local Postgres for offline
fallback. Use it only if you do not want to create a Supabase project —
in that case set `DB_HOST=db`, `DB_USER=postgres`, `DB_PASSWORD=postgres`,
`DB_NAME=kerian` in `backend/.env`. SSL is then automatically off.

### Manual run for development

```bash
cd backend
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run startWatch

cd ../frontend/kerian
npm install
npm run dev
```

Migrations run against Supabase if `DB_HOST` contains "supabase",
otherwise against the local Postgres.

## Environment variables

The backend `.env` file reads the following variables.

Required for a minimal run:

- `DB_HOST` — PostgreSQL host. For Supabase it is the connection host
  shown in Project Settings → Database (must contain "supabase", which
  the code uses as the SSL trigger). For the local Docker fallback set
  `db`, or `localhost` from the host machine.
- `DB_PORT` — usually `5432`.
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` — database credentials. Supabase
  shows them in the dashboard, the local fallback uses
  `postgres / postgres / kerian`.
- `JWT_SECRET` — JWT signing key. Can be generated with for example
  `openssl rand -hex 32`.
- `TOTP_ENCRYPTION_KEY` — encryption key for TOTP secrets at rest
  (32 bytes, base64). Required for the admin 2FA flow.

Optional, only required for the corresponding feature:

- `EMAIL_ADMIN`, `EMAIL_PASS` — Gmail address and App Password for the
  order confirmation emails.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  — for admin product image upload.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — for Google sign-in.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — for the payment flow
  (test mode). `EUR_TO_HUF_RATE` for currency conversion.
- `ANTHROPIC_API_KEY` — for the Claude-based AI recommender. Without it
  the recommender returns an empty list, so no suggestions appear on the
  cart page.
- `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` — for the Google OAuth callback
  and redirect URLs.

The frontend `.env.local` file uses two variables. `NEXT_PUBLIC_API_URL`
is the backend base URL and is required. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
is only needed for the payment flow.

The full list with placeholder values is in `backend/.env.example` and
`frontend/kerian/.env.example`.

## Demo users and admin login

After running `db:seed:all`, two demo users are available.

- `admin@gmail.com` with password `admin` — admin role, initially without
  2FA. The reviewer can log in directly with this account and immediately
  reach the `/admin` panel.
- `erik@gmail.com` with password `1234` — regular customer role, for
  demonstrating the registered customer flow.

### Trying the 2FA flow

The seeded admin is initially without 2FA, so the reviewer can log in
straight away and turn on two-factor authentication from the "Security"
tab on the `/admin` page. The flow:

1. Sign in as `admin@gmail.com` / `admin` on the frontend.
2. Navigate to the "Security" tab on the `/admin` page.
3. Click "Enable 2FA" — the UI displays a QR code.
4. Scan the QR code with an authenticator app (Google Authenticator,
   Authy, Microsoft Authenticator, etc.).
5. Enter the 6-digit code shown by the app — 2FA is now active and the
   backend returns the recovery codes.
6. Sign out and back in — the login now also requires the TOTP code,
   and only the correct code grants access to `/admin` again.

There is no email confirmation or external verification step in the
flow — scanning the QR code and entering the 6-digit code is enough.

The author's own actively-used admin account
(`elrich.020114@gmail.com`) is protected by 2FA, so two-factor
authentication is not just an optional demo feature but an actively
used security layer in the system.

### Email testing for the customer flow

By design, an admin account is not used for shopping in the system —
the `/admin` panel is for running the store, not for browsing.
Demonstrating the customer and email flow therefore requires a
customer-role user.

The seeded `erik@gmail.com` is not a real address, so an order placed
with it would send the confirmation into a stranger's mailbox (if it
exists), not to the reviewer. Instead, **register a new customer on the
frontend with your own real email address**, sign in with that account
and place the test order — the order confirmation will arrive in the
mailbox you registered with.

The admin-side order notification fires for **every test order**
regardless: it is sent to the address configured as `EMAIL_ADMIN` in
`backend/.env` via Nodemailer, no matter which customer placed the
order. So if you set `EMAIL_ADMIN` to your own Gmail address in `.env`,
you will also receive an admin-side notification for every test order —
even when the customer account is not you.

Important distinction: the `admin@gmail.com` login user in the database
and the `EMAIL_ADMIN` value in `.env` (SMTP sender and admin
notification recipient) are **two completely separate things** — no
code connects them. The former is for sign-in, the latter is for
sending and receiving emails.

The `/admin` page on the frontend will guide the user through this
enrollment flow on first sign-in, so it is also possible from the UI.

## External services

The system relies on the following SaaS providers.

Supabase is the primary managed PostgreSQL provider — both development
and review runs target Supabase. A free project is sufficient. SSL is
enabled automatically when `DB_HOST` contains "supabase"; both the
backend runtime (`backend/dataBase.js`) and the Sequelize CLI
(`backend/config/config.js`) honor this. As an alternative, the
`postgres:15` image shipped in `docker-compose.yml` can be used if you
prefer not to set up a Supabase project.

Cloudinary stores and serves the product images.

Stripe handles card payments via Checkout and webhooks. The repository
is configured with test mode keys only, no live payments are active.

Google OAuth is an optional sign-in method. It requires a Google Cloud
project with the authorized redirect URI set to
`<BACKEND_BASE_URL>/auth/google/callback`.

The Anthropic Claude API uses the Haiku 4.5 model for the cart-based
product recommender, with prompt caching for cost optimization.

Gmail SMTP is used for order confirmation emails through Nodemailer. A
Gmail account with an App Password is required.

## Known limitations

The following limitations are knowingly accepted in the current state of
the project, including security hardening items deferred for future work:

- No automated tests. Verification is manual, the test report lives in
  the testing chapter of the thesis.
- The JWT is stored in `localStorage`, which is XSS-sensitive. Migration
  to `httpOnly` cookies is tracked in GitHub issue #50.
- The OAuth handoff store is in-memory. It works only on a single backend
  instance, multi-instance deploys would require Redis. GitHub issue #51.
- No email verification for password registration. Google sign-in does
  require `email_verified: true` from Google. GitHub issue #52.
- No "link Google to existing account" UI on the profile page. GitHub
  issue #53.
- No device or session management. Users cannot view or revoke active
  sessions. GitHub issue #54.
- Stripe is in test mode only, no live keys are committed.
- The AI recommender disables itself if `ANTHROPIC_API_KEY` is not
  configured — no suggestions appear on the cart page in that case.

The full security roadmap is the "OAuth hardening roadmap" umbrella issue
on GitHub.

## References

- Thesis text: [`docs/Birkl Erik András szakdolgozat.docx`](docs/)
- Development guidelines: [`CLAUDE.md`](CLAUDE.md) (coding conventions,
  architecture, project-specific rules).
- Code style: [`code-style-guide.md`](code-style-guide.md)
- Detailed project structure: see the "Project Structure" section in
  `CLAUDE.md`.
