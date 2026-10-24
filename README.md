# ARTOPIA — Indian Art Studio

**Rooted in India. Made to Move You.**

ARTOPIA is a full-stack gallery and commissioning studio built with React, TypeScript, Vite, Express, Prisma, and PostgreSQL. It uses the supplied seed catalogue as its product source and preserves the project's existing database records and API workflows.

## Catalogue and assets

The supplied `seedData/seed.json` contains 12 painting records, five pottery forms, six glaze options, INR currency, and a wall-mural rate of ₹150 per sq ft. Painting image names map directly by record ID to `seedData/images/p-001.jpg` through `p-012.jpg`. The supplied archive has no pottery or mural photos, so those pages use typography and original interface decoration instead of substitute product imagery. The seed files are unchanged.

## Included workflows

- Responsive landing page, paintings gallery, painting details, search/filter/sort, quick view, and desktop 3D exhibition.
- Persistent artwork bag for unique paintings; each one is checked out individually through the existing server-side availability and order locking.
- Painting purchases and timed auctions, with bids and single-winner checkout handled by the API.
- Mural booking wizard using the configured rate, date availability, and server-side date locking.
- Pottery requests with actual seeded forms/glazes, quantity/date validation, custom notes, and customer edit/cancel rules.
- Customer activity dashboard and protected studio administration for paintings, orders, bookings, pottery, and activity.
- Server sessions, input validation, ownership checks, role guards, and CSRF/origin checks.

No payment processor is connected; a successful purchase creates an order record. The public application exposes exactly two roles: Customer and Studio Admin. Existing database rows with the legacy `admin` enum are normalized to Studio Admin in API responses; no role rows are deleted or rewritten. Public registration only creates Customer accounts.

## Setup

Requirements: Node.js 22+ and PostgreSQL. Copy `.env.example` to `.env` and set `DATABASE_URL`, `STUDIO_ADMIN_EMAIL`, and `STUDIO_ADMIN_PASSWORD` (12+ characters). Preserve your existing `GEMINI_API_KEY` and `APP_URL` if you use those integrations. Never commit `.env`.

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The Vite development server proxies API calls to the Express server on port 4000. For separate terminals, run `npm run dev:api` and `npm run dev:web`. The seed command inserts missing records and leaves existing rows unchanged.

For a production build, run `npm run build`, then start the server with `npm start` after configuring production environment variables and allowed origin in `APP_ORIGIN`.

## Verification

```bash
npm run lint
npm test
npm run build
```

`npm test` runs the focused server policy/session tests. Database-backed purchase, booking, and pottery workflows require a configured local PostgreSQL instance and should be exercised with a test account/database, not against records you need to preserve.
