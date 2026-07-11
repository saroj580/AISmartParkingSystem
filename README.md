# Smart Parking Management System — Backend

A production-oriented, modular-monolith backend for a multi-tenant smart
parking platform: drivers book parking spaces by vehicle category, operators
manage lots/pricing, payments are settled in cash at the lot and confirmed
by the operator, and check-in/out is done via signed QR codes.

## Tech stack

Next.js 15 (App Router, API-only) · TypeScript · Prisma ORM · PostgreSQL ·
Redis · JWT (access + refresh) · Cloudinary · Zod · Resend ·
Google Maps · `qrcode` · `node-cron`

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — module boundaries, request
  lifecycle, double-booking prevention, caching, scaling notes
- [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) — full entity-relationship diagram
- [`docs/API.md`](docs/API.md) — complete REST API reference
- [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) — annotated folder tree
- [`docs/SEQUENCE_DIAGRAMS.md`](docs/SEQUENCE_DIAGRAMS.md) — auth, booking,
  payment, QR check-in/out, and expiry-job flows

## Getting started

### 1. Prerequisites

- Node.js 20+
- A running PostgreSQL instance
- A running Redis instance

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in at minimum: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, `QR_CODE_SECRET`. Everything else (Cloudinary, Resend,
Google Maps) degrades gracefully in development if left as placeholders —
those features will simply no-op or return a clear error when actually
invoked.

### 4. Set up the database

```bash
npm run prisma:migrate   # creates tables from prisma/schema.prisma
npm run db:seed          # optional: seeds an admin, operator, driver, and a sample lot
```

### 5. Run the app

```bash
npm run dev
```

The API is served at `http://localhost:3000/api/v1`.

### 6. Run the background worker (separate process)

```bash
npm run worker
```

This schedules the cron jobs described in `docs/ARCHITECTURE.md` (expired
booking release, reminders, nightly analytics rollup, cleanup). It's
intentionally decoupled from the request-serving process so it can be scaled
or deployed independently.

## Useful scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / start |
| `npm run typecheck` | `tsc --noEmit` across the whole project |
| `npm run lint` | ESLint (flat config, Next.js + TypeScript rules) |
| `npm run prisma:studio` | Browse the database visually |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed sample data |
| `npm run worker` | Run the background job scheduler |

## Roles

- **DRIVER** — registers vehicles, searches/books parking, pays in cash at
  the lot, receives a QR code once the operator confirms payment, checks
  in/out.
- **OPERATOR** — manages their own parking lots, zones, spaces, pricing
  rules; views bookings/analytics for their lots; scans QR codes.
- **ADMIN** — platform-wide visibility: user management, operator
  verification, platform analytics.

## Seeded accounts (after `npm run db:seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@smartparking.com` | `Password123` |
| Operator | `operator@smartparking.com` | `Password123` |
| Driver | `driver@smartparking.com` | `Password123` |
