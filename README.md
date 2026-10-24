# OBSURA — Immersive Art Studio

> *“There’s more that meets the eye.”*

**OBSURA** is a high-fidelity frontend web application for an immersive art studio, featuring an interactive WebGL dither veil hero, an orbiting 3D Galaxy Exhibition, an editorial fine art gallery, procedural 3D pottery with traditional Indian relief carvings, an on-site mural booking calendar, customer collection management, and a comprehensive studio administration desk.

---

## Architecture

OBSURA now includes a TypeScript/Express API backed by PostgreSQL through Prisma. `src/services/` calls the API by default. The existing demo store is only available when `VITE_DEMO_MODE=true` in development; it is never selected by a production build. The supplied `seedData/seed.json` and image files are read by the database seed script and remain unchanged.

---

## 🎨 Key Experiences & Features

1. **DitherVeil Hero & Brand Identity**
   - **New Eclipse Logo**: Clean SVG eclipse revealing an iridescent light disc with 4-point sparkle and Fraunces wordmark, positioned top-left (≥56px desktop, 40px mobile, 28px padding).
   - **Dither Shader**: Floyd-Steinberg error-diffusion dithering on a 2px spatial grid with obsidian ink, ivory dots, violet rim, and cursor veil reveal.
   - **Stacked HeroButtons**: Customer CTA and Admin CTA stacked with 16px gap, featuring dot-matrix hover fill, cursor-angle tracking iridescent borders, and cryptographic text scramble.
   - **Typography**: Display/wordmark in **Fraunces**, tagline in **Instrument Serif Italic**, UI in **Manrope**, and monospace strictly reserved for HUD chips.

2. **3D Galaxy Gallery (`/gallery` — 3D Exhibition Mode)**
   - Orbiting 3D scene built in pure Three.js over a glossy reflective obsidian ground plane (`#05060A`) beneath a starry sky dome.
   - **12 Paintings in Ring**: True aspect-ratio wooden frames with warm spotlighting, artist plaques, and click-to-inspect.
   - **Pottery Constellation**: 5 pieces displayed on illuminated plinths with floating labels.
   - **Interactive Wall Mural Plane**: Dynamic size-preview slider with real-time rate formula (`₹150/sq ft`).
   - Orbit camera controls with Section Switcher (All / Paintings / Pottery / Wall Art), Controls HUD card, and smooth Auto-Rotate toggle.

3. **Fine Art Editorial Browse & Loupe Inspection (`/gallery`)**
   - Dual-mode switch between **3D Walk** and **Browse 2D Grid**.
   - Preserves natural portrait (e.g. `p-003`, `p-004`, `p-011`) and landscape aspect ratios up to 1.50 without cropping.
   - **Shared ItemDetailModal**: Split layout matching specification (left = contain artwork / interactive 3D pottery, right = Fraunces details, Buy / Request actions).
   - **3-Step CheckoutDialog**: Review → Shipping (10-digit Indian phone, address lines, city, state, 6-digit PIN code) → Confirmation with immediate receipt.

4. **Procedural Indian Earthenware Atelier (`/pottery`)**
   - Interactive Three.js canvas with 5 lathe silhouettes (Chaddi, Handi, Surahi, Kalash, Matka).
   - **Indian Relief Carvings**: Procedural canvas bump maps generating traditional zigzag chevron, paisley ambi, jaali lattice, lotus petal, and vertical fluting motifs.
   - **6 Earthy Glazes**: Terracotta, Ochre Earth, Forest Moss, Deep Cobalt, Raw Clay, and Slate Charcoal.
   - Strict 14-day minimum crafting lead time and client edit/cancel workflow.

5. **On-Site Mural Wall Commissions (`/wall`)**
   - 4-step wizard: Custom Asia/Kolkata date picker (7–90 days ahead), dimensions slider (10–500 sq ft) with synced rate formula (`₹150/sq ft`), site address, and booking review.
   - Real-time 409 conflict detection preventing double-booking of dates.

6. **Collector Dashboard (`/account`)**
   - **Acquisitions**: Order history with delivery address audit. Cancelling an order immediately restores the original painting to `available` in the gallery.
   - **Mural Bookings**: Status tracker with automatic lock 3 days before scheduled execution.
   - **Pottery Requests**: Track custom commissions with in-flight editing for unapproved requests.

7. **Studio Admin Desk (`/admin/*`)**
   - Metrics overview (inventory, pending requests, confirmed murals).
   - Inventory manager: Add/edit paintings (editing locked for sold pieces).
   - Mural reservation management: Confirm or decline bookings with immediate calendar sync.
   - Pottery commission approvals: Accept or decline into studio production.
   - Read-only sales audit: Preserves customer shipping addresses with strictly NO cancel action.
   - Real-time chronological studio activity feed.

---

## Getting Started

Requirements: Node.js 22 or newer and PostgreSQL 14 or newer.

1. Create a PostgreSQL database named `obsura` and a database user with permission to create tables.
2. Copy `.env.example` to `.env`, set `DATABASE_URL` to your local `artstudio` database, and choose a unique `STUDIO_ADMIN_EMAIL` and `STUDIO_ADMIN_PASSWORD` (at least 12 characters).
3. Install packages, apply the migration, seed the supplied catalog, then start both servers:

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. Vite proxies `/api` to Express on port 4000. `npm run dev:api` and `npm run dev:web` start the two processes separately. For a production build, run `npm run build`, then `npm start`; Express serves the built frontend and API from the same origin. Set `NODE_ENV=production` and the production `APP_ORIGIN` when deploying; container platforms may also require `HOST=0.0.0.0`.

The Prisma schema and initial migration are in `prisma/`. `npm run db:migrate` is intended for local schema development; use `npm run db:deploy` for applying committed migrations.

Run the focused policy/session tests with `npm test`, and type-check both apps with `npm run lint`.

---

## Sign-in

The studio account is created by `npm run db:seed` from the `STUDIO_ADMIN_*` environment variables if it does not already exist. The seed script inserts missing catalog rows and leaves existing records unchanged. Customer accounts are created through the signup screen. Sessions are stored server-side; the browser receives only an HTTP-only session cookie. No default admin password is shipped.

---

## 🛠 Developer Testing & Diagnostic Tools (`?dev=1`)

The `?dev=1` drawer exercises the in-memory demo store, not PostgreSQL. The API remains the default. To use demo mode locally, set `VITE_DEMO_MODE=true` in `.env`; it is gated to Vite development and cannot be enabled in production.

```
http://localhost:3000/?dev=1
```

Features available in `?dev=1` mode:
- **Simulate 409 Painting Conflict**: Mark a painting as sold by another buyer to test concurrent acquisition handling.
- **Simulate 409 Date Conflict**: Book a calendar date elsewhere to test mural double-booking prevention.
- **Simulate 401 Session Expiry**: Invalidate token to verify redirect flow with saved return path.
- **Simulate Latency**: 0ms, 200ms, 800ms, 2000ms.
- **Reset to Fresh Seed**: Wipe `sessionStorage` and restore pristine seed data.
- **Quick Role Switcher**: Toggle between Collector and Curator sessions.
