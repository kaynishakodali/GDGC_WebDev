# OBSURA: master prompt (FRONTEND ONLY, final specification)

Act as a senior creative developer, art director and UI engineer. Build (or, if a project already exists in the workspace, **reconcile the existing project with this specification without throwing away parts that already work**) the complete Obsura frontend. Do not give me only a plan or snippets. Run the app and verify before claiming anything works; if you did not test something, say so.

## 0. Hard rules

1. **NO BACKEND.** Codex will build the backend later. Create no server, database, ORM, auth server, API routes, password hashing, JWT/session code or secrets. Delete any of these if they already exist (including `server/`, Express/Next API routes, Prisma/SQLite/Postgres/Mongo, migrations, `dev:server`/`db:*` scripts and their dependencies). The only command to run the project is `npm install && npm run dev`.
2. Temporary state for demos lives in **one clearly labeled frontend-only folder**, `src/demo-data/`, which loads the seed JSON and keeps state in React memory. Every file there starts with: `TEMPORARY FRONTEND DEMO DATA: no server, no database. To be replaced by the real backend (Codex).` All screens call functions in `src/services/` (one function per action, e.g. `listPaintings`, `buyPainting`, `createBooking`); only `src/services/` talks to `src/demo-data/`. Later, only the service functions change to `fetch` calls. Write `API_CONTRACT.md` listing every endpoint, request, response and error shape the backend must provide (state plainly: "frontend only; backend to be built separately").
3. **All content comes from the seed data only.** No outside images, no invented artworks, prices, artist bios, reviews, awards, clients, stats, social links or contact details.
4. Nothing in the UI may expose the demo plumbing: no dev/mock panel, no "Signed in as …" demo text, no printed credentials. (A hidden `?dev=1` panel is acceptable, off by default.)
5. Change only what is specified when fixing things. Do not rewrite working parts.

## 1. Files provided (inspect first, print what you find)

- `public/seed/seed.json` + `public/seed/images/p-001.jpg … p-012.jpg` (from my seed zip). Real structure:
  - `currency: "INR"` (format ₹ with Indian grouping, e.g. ₹24,500).
  - `paintings[12]`: `id, title, artist, description, price, imageUrl, status ("available"|"sold")`. `p-004` and `p-009` are sold. `p-012` has a deliberately very long title and description (layout stress test). Images are 800px wide with different aspect ratios (tall portraits: `p-003`, `p-004`, `p-011`), so never force one ratio. Resolve image URLs as `/seed/images/…` via `import.meta.env.BASE_URL`.
  - `potteryItems[5]`: `id, name` only (Kulhad, Surahi, Matka, Diya set, Gamla). **No pottery images and no pottery prices exist. Do not invent any.**
  - `glazes[6]`: `id, name` only (Kumkum Red, Haldi Yellow, Mehendi Green, Indigo Blue, Sandalwood Beige, Charcoal Black).
  - `mural.ratePerSqFt: 150` (read it from data; never hardcode 150).
  - `studioAccount` role is `"studio"`: label it **Admin** in the UI and accept both `admin` and `studio` as the admin role value.
- `docs/GDGC-WebDev-Volunteer-Recruitement.pdf`: the assignment rules (restated in section 12).
- `docs/reference-screenshots/`: `landing-dither-mono.png`, `landing-dither-color-reveal.png` (landing hero look), `galaxy-gallery-target.png` (3D gallery look), `details-modal-target.png` (pop-up layout), `rbac-table.png`.
- `existing-landing/`: **my Google AI Studio landing hero (code + chrome-head image). It is final and approved.** Reuse it verbatim. Do not redesign, re-dither, recolor, re-crop or "improve" it (same image, Floyd–Steinberg 2px pattern, ivory dots with violet halo, cursor sweep color reveal, click shockwave, HUD chips and hint text). Only wrap it (fix leaks/resizing/reduced-motion without changing how it looks). If this folder has no code or image, **stop and tell me instead of recreating it.**

## 2. Brand and visual identity

- Name **Obsura**. Tagline: **“There’s more than meets the eye.”**
- **Logo (new, replace any old one completely): an eclipse that reveals light.** A thin ivory ring; inside it a softly glowing iridescent disc (lilac to rose to peach to pale aqua) partly covered by a dark offset circle so only a crescent of glow shows; one small four-point sparkle at the upper right. Clean SVG, no dithering, no eye shape, no clip-art look; recognizable at 32px, refined at 120px. Lockup = eclipse mark + "OBSURA" wordmark. Variants: full lockup, mark only, one-color ivory, favicon/app icons. The crescent glow breathes slowly and brightens on hover (static under reduced motion).
- **Logo placement:** **big and only at the top-left corner of every page** (including the landing, 3D gallery, modals' page behind, admin, error pages): at least 56px tall on desktop (40px mobile), 28px from the top and left edges, highest z-index, **completely visible, nothing may overlap it** (move HUD chips and other elements away), links home. Use one persistent `BrandBar`.
- **Fonts (unique, not ordinary):** display/headings/wordmark = **Fraunces** (variable; soft/wonky axes, weight 300, large optical size, italic for emphasis); tagline and accent lines = **Instrument Serif Italic**; UI/body = **Manrope** (or Outfit); small labels uppercase with wide tracking; the mono font only inside the existing hero HUD chips. Self-host (`@fontsource`) or Google Fonts with `font-display: swap` and fallbacks. Do not use Inter, Roboto, Arial, Playfair or Bodoni. If a font hurts legibility, choose a similarly distinctive alternative and tell me.
- **Palette (dreamy):** `--night #07060D`, `--indigo #12102A`, `--plum #1D1536`, `--lilac #C9B8FF`, `--rose #FFB8D6`, `--peach #FFD3B0`, `--aqua #9FE8F2`, `--moon #F6F1FF` (primary text), `--mist #B7B0C9` (muted), `--ok #3DDC97`, `--danger #FF5C5C`. Contrast stays WCAG AA.
- **Dreamy style across the whole customer UI** (login, signup, Browse, detail modal, wall booking, pottery request, checkout, dashboard, empty/error/loading states, 404/403, 3D UI):
  - layered, blurred aurora/nebula blobs (lilac, rose, indigo, a hint of aqua) drifting very slowly behind content (30 to 60 s CSS loops, `transform` only), soft film grain, a limited number of twinkling stars, gentle vignette;
  - frosted translucent cards with 1px luminous gradient borders, inner glow, ~24px radius, pill buttons;
  - airy large Fraunces headings with italic accent words, generous spacing, short poetic copy ("Step into the glow", "Look closer") while errors and form labels stay plain;
  - artwork glows and floats slightly on hover; images show the dither-to-color reveal in Browse mode (never hiding price/status/buttons; color always on touch and reduced motion);
  - all primary buttons use the shared `HeroButton` effects with a glow; soft light-trail cursor on desktop pointers only (normal cursor on inputs/buttons); soft blur-dissolve page transitions under 500ms; scroll reveals with fade-up and faint blur-in; glowing input focus rings; skeletons shimmer in lilac.
  - **Admin is calmer and cleaner** (dense tables, minimal motion, subtle indigo background, no animated blobs) but uses the same logo, fonts and colors.
- Performance rules for the style: animate `transform`/`opacity`, limit blur radius and blurred layers, pause background animation when the tab is hidden. `prefers-reduced-motion` removes drifting, twinkling, cursor trail and transitions (static gradients stay).

## 3. Landing page (`/`)

Contains **only**: BrandBar (big logo top-left), the large "OBSURA" hero title (Fraunces, moon-white with a faint lilac glow), the tagline, the two buttons, and the existing AI Studio hero with its HUD chips and hint line. **Remove** any "Signed in as …", "Enter Studio", bottom bar, "Explore collection" or "Edition 2026" text.
- **Tagline** `“There’s more than meets the eye.”`: Instrument Serif Italic, `font-size: clamp(30px, 4.2vw, 60px)`, line-height 1.15, soft lilac-to-rose-to-peach gradient text with faint glow, aligned to the **left margin** (same left edge as logo and title, about 5vw) in a text column no wider than ~46vw. The entire sentence including both curly quotes and the full stop is **always visible and never overlapped** at every width from 360px to 1920px (wrapping to two lines is fine). Put text above the canvas in stacking order, with a flat dark scrim (`#07060D` fading to transparent, left to right). On desktop anchor the hero art to the right so the face never runs under the text column; on mobile give the text its own readable area. Do not crop or distort the head.
- **Buttons:** one shared `HeroButton` used for both, with **identical** hover/focus/press/touch effects (dot-matrix fill sweeping in from the pointer, iridescent border following the pointer angle, slight magnetic pull, text scramble). Only the label, icon (arrow vs lock) and accent color prop differ (Customer = lilac, Admin = peach). **Login as Admin is stacked directly below Login as Customer**, same width, 16px gap, left-aligned under the tagline. Opaque `--surface` backgrounds above the canvas so dots never show through the labels. Keyboard focus shows the same effect; reduced motion = simple color transitions.
- HUD chips ("Pattern: FLOYD", "Grid: 2px", CONTAIN/fullscreen) and the hint line keep their content but must never overlap the logo, title or buttons; place them along the bottom/right edges, fully inside the viewport (`100dvh`, safe-area padding).
- Customer → `/login`; Admin → `/admin/login` (dither-dissolve transition). If already signed in, the page looks identical and the buttons go straight to `/gallery` (customer) or `/admin` (admin).
- Background aurora glows may sit behind the page but must not tint the head.

## 4. Auth

- `/login` and `/signup` (customer; sign-up has name, email, password with strength hint) and `/admin/login` (no sign-up link, no public admin registration).
- The frontend never decides roles: after login call the service for the current user and route by the returned role; a customer on the admin page (or vice versa) sees "This account can't use this area". Keep any session flag non-sensitive (no tokens in `localStorage`); the demo session lives in memory. Session expiry (401) leads to login with "Your session expired" and a return path.
- After customer login, go to `/gallery` (3D by default on desktop). After admin login, go to `/admin`.

## 5. Gallery (`/gallery`): "galaxy" 3D exhibition + Browse mode

Header switch: **3D** | **Browse**. Browse is the default on touch devices, when WebGL is unavailable, or with reduced motion. **Buying must never depend on WebGL.**

### 5.1 3D mode: target look = `galaxy-gallery-target.png` (Obsura-branded)
- **No walls, no ceilings, no grey rooms, no pointer-lock walking.** Everything around the art is very dark; only the art is highlighted.
- Background `#05060A` with a subtle starfield (a few faint lilac/ivory stars, slow drift), optional extremely faint nebula glow, no grey fog.
- Floor: glossy dark plane with **real reflections** (drei `MeshReflectorMaterial`, ~512 resolution, blur, mirror ~0.6) fading to black; fallback to faked flipped/faded reflections on low-end/mobile or failure. Cap pixel ratio at 1.5.
- Lighting: dim ambient; each artwork has its own spotlight/rim glow and a thin glowing lilac edge; sold paintings are dimmer with a red "SOLD" tag.
- Camera at the center of the ring **orbits**: drag/swipe rotates, scroll/pinch zooms (clamped), click/tap an artwork opens its details. Keyboard: Left/Right rotate, +/- zoom, Tab cycles artworks, Enter opens. Smooth damping.
- **Auto-Rotate toggle** (on by default unless reduced motion): slow rotation that pauses while dragging or while a modal is open and resumes after a few idle seconds.
- Three constellations with a **section switcher** at bottom-center (**Paintings | Pottery | Wall Art**); the camera flies smoothly (cuts under reduced motion):
  1. **Paintings ring:** all 12 paintings around the viewer facing inward at eye level with slight alternating tilt/height. Each frame uses the painting's **real aspect ratio** with a consistent max height. Nothing may be skipped (enlarge radius or use two staggered rows if needed). Texture loading: update the material when the texture loads, `colorSpace = SRGBColorSpace`, placeholder with the title if an image fails, log counts of paintings/frames/textures.
  2. **Pottery:** the 5 items on slim floating plinths with a faint glowing base ring over the reflective floor, each slowly turning, with its **name always visible** as a floating billboard label.
  3. **Wall Art:** a lit rectangular wall plane floating in the dark with a measurement grid and a person-height silhouette; wall-size slider (10 to 500 sq ft) with live price from the seed `ratePerSqFt`; "Plan your wall" button. No invented mural images.
- A bottom-center nameplate shows the artwork facing the camera (title clamped to 2 lines, artist, price in ₹, Available/Sold, "View details").
- **3D interface (like the target, in Obsura style):** top-left BrandBar pill with the big logo; bottom-left "Controls" card (Rotate: drag/swipe, Zoom: scroll/pinch, Inspect: click/tap) with icons; bottom-right **Auto-Rotate** toggle; top-right 3D/Browse switch and Account menu. Dark dreamy pills/cards, 1px borders, lilac accent (not blue). Lazy-load the 3D chunk; wrap in an error boundary that falls back to Browse with a message; pause rendering when the tab is hidden; dispose textures/geometries on unmount.
- Tell me the cause first if artworks do not appear: do not use any `metadata.json`/`public/images` path from reference projects; use the same service data as Browse.

### 5.2 Browse mode
Asymmetrical editorial grid of all 12 paintings (tile proportions from real image ratios) plus a pottery strip of the 5 items (same carved earthy objects as small renders). Filters All/Available/Sold, sort by price. Hover = dither-to-color + tilt + quick info. Loading skeletons, empty (filter has no results) and error-with-retry states. Clicking a tile opens the details pop-up (section 6).

## 6. Details pop-up: `ItemDetailModal` (target = `details-modal-target.png`)

One shared component used for **paintings and pottery**, opened from the 3D gallery (click/tap/Enter), Browse tiles, `/pottery` item cards, and the `/gallery/:id` route (shareable link; Esc/close returns to the previous page).
- **Layout (desktop):** centered modal (~90vw x 88vh, max ~1200px), ~28px radius, dimmed blurred backdrop. **Left half = image, full height**: paintings are never cropped or stretched (`object-fit: contain` over a blurred enlarged copy of the same image). **Right half = details**, vertically centered, scrollable (`p-012` must not overflow). Round close button top-right (also Esc and backdrop click), focus trapped and restored. Entrance: image reveals, then text staggers in (fade only under reduced motion). Prev/Next arrows and Left/Right keys move between items of the same kind. **Mobile:** image on top (~40vh), details below scrollable, close button always visible.
- Style: small uppercase label in lilac, title in Fraunces, lilac-to-rose accent bar, moon/mist text, status dot green (available) or red (sold).
- **Paintings** (label **EXHIBIT DETAILS**): full title, accent bar, "By {artist}", full seed description (do not parse or invent), divider, details list: **Price** (₹), **Status** (dot + Available/Sold), **Reference** (id in small mono). Action area:
  - Available + signed-in customer: **Buy this painting** opens the shared `CheckoutDialog` (section 8). After success the modal shows confirmation and the item flips to Sold everywhere (3D scene, Browse, detail route, My Orders).
  - Sold: no buy button, message "This painting has found its home. It's no longer available."
  - 409 just sold: clear message, flip to sold, refetch.
  - Signed out: "Log in to buy", then return to this painting. Admin: details only, no buy.
- **Pottery** (label **PIECE DETAILS**): left = live slowly turning 3D piece (small lazy canvas, drag to rotate, carved design, earthy colors; static snapshot fallback for no-WebGL/reduced motion). Right = name from the seed, accent bar, "Handmade to order.", glaze picker (6 seed glaze names as earthy swatches that recolor the piece), divider, details list: **Price:** "Not listed. Pottery is made on request." (never invent one), **Glazes available** (the 6 names), **Quantity per request** 1 to 12, **Needed-by** at least 14 days from today, **Status** green dot "Open for requests". Button **Request this piece** goes to `/pottery` with item and glaze preselected (signed-out: login first, then return). Admin: details only.
- States: loading skeleton in both halves, error with Retry, not-found message, live update if the item changes while open. Accessible: `role="dialog"`, `aria-modal`, `aria-labelledby`, alt text from title and artist, `aria-live` for purchase results.

## 7. Pottery look (everywhere: 3D, Browse, modal, `/pottery`)

- **Names always shown** (from the seed) wherever a pottery item appears.
- **Earthy palette, no red.** Unglazed clay = terracotta `#B5734A`. Glaze lookup (clearly commented as a presentation mapping keyed by seed glaze names): Kumkum Red → `#9C4A32` (muted brick/burnt sienna), Haldi Yellow → `#C9962E` (ochre), Mehendi Green → `#6B7A3A` (olive), Indigo Blue → `#3F4F73` (muted slate indigo), Sandalwood Beige → `#CBB08A`, Charcoal Black → `#2E2B28` (warm charcoal). `MeshPhysicalMaterial`, moderate roughness, slight clearcoat, warm lighting.
- **Carved designs on every piece**, procedural: canvas-drawn grayscale height map as `bumpMap` (plus normal map or light `displacementMap` on a finely segmented `LatheGeometry`, ~128 x 96), UV-mapped around the form, readable under spotlights (rim light + moderate `bumpScale`). Motifs (classic Indian craft patterns, no claim of a specific tradition): Kulhad zigzag and dotted bands; Surahi paisley (mango) motifs on the belly and fine neck rings; Matka diamond lattice with a petal band; Diya set (three lamps) radiating petals and dotted rim; Gamla vertical fluting with a lotus medallion. Glaze changes recolor without regenerating the carving; cache and dispose textures.
- Shapes via `LatheGeometry` profiles: Kulhad tapered cup, Surahi narrow-necked jug, Matka round pot, Diya set three shallow lamps with soft emissive flames, Gamla wide planter.

## 8. Buying a painting + shipping checkout

Shared `CheckoutDialog` used from the details pop-up (3D and Browse) and `/gallery/:id`. Flow: Review → Shipping details → Confirm.
- Fields: full name, phone (10-digit Indian mobile starting 6 to 9), address line 1, address line 2 (optional), city, state (dropdown), PIN code (6 digits). Inline errors beside fields, accessible labels, `autocomplete` attributes.
- Show thumbnail, title, artist, price. Say clearly: "No payment is taken here. The studio will contact you to arrange delivery." No fake delivery promises or tracking.
- Calls `buyPainting({ paintingId, shipping: { fullName, phone, line1, line2, city, state, pincode } })`. The demo layer validates (422 with field errors) and returns 409 if just sold. Prefill from the customer's previous order via the service (not localStorage). Disable the button while submitting; success only after the service confirms.
- The shipping address is shown on the order in **My Orders** and in the **admin Orders** view (read-only; admin cannot cancel). Document the `shipping` object in `API_CONTRACT.md`.

## 9. Book a wall (`/wall`)

Multi-step dreamy form (Date → Wall → Address → Review), state kept when going back.
- **Date:** custom accessible calendar (keyboard arrows, `aria-selected`, `aria-disabled`); enabled only from today+7 to today+90 inclusive, using date-only strings in **Asia/Kolkata**; dates reported unavailable are disabled and labeled "Booked".
- **Wall:** slider + numeric input synced, 10 to 500 sq ft, animated wall preview; show **"Rate: ₹{ratePerSqFt}/sq ft × {size} = ₹{total}"** with an animating total (rate from data).
- **Address:** required textarea with sensible minimum length.
- **Review & submit:** success shows status **requested** and links to the dashboard. On **409 (date taken)**: refetch unavailable dates, return to the Date step, mark the date taken, say "Someone just booked that date. Please pick another." 422 shows field errors. Never show success before the service confirms; disable the button while submitting.

## 10. Custom pottery request (`/pottery`, `/pottery/:requestId/edit`)

Choose one of the 5 seed items (cards showing the carved 3D/render preview and the name, each with a "Details" button opening the modal), one of the 6 seed glazes (earthy swatches that recolor the preview), quantity stepper 1 to 12, and needed-by date (calendar, at least 14 days from today). Items and glazes come only from the data. Success shows status **requested**; field errors beside inputs. Edit page reuses the form, allowed only while `requested` (otherwise a locked state with the reason). Cancel with a confirmation dialog.

## 11. Customer dashboard (`/account`) and admin

### Customer (`/account`, tabs with animated indicator)
- **Orders:** thumbnail, title, price, order status (`placed`/`cancelled`), date, **shipping address**; "Cancel order" only while `placed` (confirmation; note that the painting becomes available again).
- **Wall bookings:** date, size, address, rate, total, status (`requested`, `confirmed`, `declined`, `cancelled`); Cancel enabled only while `requested`/`confirmed` **and** today is at least 3 days before the booking date, otherwise disabled with the reason "Cancellation closed 3 days before your date".
- **Pottery requests:** item, glaze, quantity, needed-by date, status (`requested`, `accepted`, `declined`, `cancelled`); Edit/Cancel only while `requested`.
- Each tab: loading skeletons, empty state ("Nothing here yet. Step into the gallery."), error with retry. Status badges use color **and** text/icon and match values exactly.

### Admin (calm layout, protected, admin only)
Routes: `/admin/login`, `/admin`, `/admin/paintings`, `/admin/bookings`, `/admin/pottery`, `/admin/orders`, `/admin/activity`; separate `AdminLayout` with sidebar and the big logo top-left.
- **Dashboard:** counts (available vs sold paintings, orders placed/cancelled, bookings requested/confirmed, pottery requests requested) with quick links to pending actions, from real data.
- **Paintings:** table (thumbnail, title, artist, price, status), search + status filter; "Add painting" form (title, artist, description, price, image path/URL; no uploads); Edit **only while available** (disabled with explanation for sold); a cancelled order restores availability after refetch.
- **Bookings:** customer, date, size, address, rate, total, status; Confirm/Decline only on `requested`; filters; note that a date can have only one active booking; surface 409s.
- **Pottery requests:** customer, item, glaze, quantity, needed-by, status; Accept/Decline only on `requested`.
- **Orders:** read-only list (painting, customer, status, date, **shipping address**). **No cancel anywhere in admin.**
- **Activity:** chronological, filterable list built from real records; no invented events.
- Admins never see Buy/Book/Request buttons; confirmation dialogs for status changes.

## 12. Business rules the frontend and demo layer must follow

- Paintings are unique (`available`/`sold`); sold ones cannot be bought or edited; cancelling an order makes the painting available again.
- Order statuses `placed`, `cancelled`; booking `requested`, `confirmed`, `declined`, `cancelled`; pottery `requested`, `accepted`, `declined`, `cancelled`.
- Booking: date today+7 to today+90 inclusive, one active booking per date (declined/cancelled free the date), wall 10 to 500 sq ft, price = size × rate from data, customer cancels until 3 days before, admin confirms/declines only from `requested`.
- Pottery: seed item + seed glaze, quantity 1 to 12, needed-by at least 14 days away, customer edits/cancels only while `requested`, admin accepts/declines only from `requested`.
- RBAC (simulated now, enforced by the real server later): 401 not logged in, 403 wrong role, 404 for another customer's record, 409 conflicts/illegal state changes, 422 validation with field errors. Error shape: `{ "error": { "code": "PAINTING_SOLD", "message": "...", "fields": { ... } } }`. The UI hides forbidden actions for UX but treats the server as the authority.
- Customer: browse, buy, cancel own orders, book, cancel bookings within the window, request/edit/cancel pottery while requested, see only own records. Admin: browse, add/edit available paintings, view all records, confirm/decline bookings, accept/decline pottery; cannot buy, book, request or cancel.

## 13. Cross-cutting quality

- Every data screen has loading skeleton, success, empty, error-with-retry, 403 page, 404 page and session-expired handling. 409s always show a clear human message and refresh stale data. No fake success; disable submit buttons while in flight.
- Reusable components: `BrandBar`, `Logo`, `HeroButton`, `DitherImage`, `ItemDetailModal`, `CheckoutDialog`, `Calendar`, `StatusBadge`, `Field`, `Dialog`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `ProtectedRoute` (role-aware), `CustomerLayout`, `AdminLayout`, `PageTransition`, `PotteryObject3D`, `PaintingFrame3D`.
- Motion via `motion/react`; shared-element (`layoutId`) transition from a Browse tile to its modal; everything respects `prefers-reduced-motion`.
- Accessibility: semantic landmarks, skip link, everything keyboard-operable (calendar, 3D controls, modal), visible focus rings, AA contrast, labeled fields with `aria-describedby` errors, `aria-live` for results, meaningful alt text, correct heading order.
- Mobile: no pointer-based tilt or custom cursor, simplified effects, touch-sized targets, no horizontal overflow.
- Performance: route-level code splitting, 3D chunk only for `/gallery`, lazy images with explicit width/height, minimal dependencies (comment why each non-obvious one is used).
- Stack: React + Vite + TypeScript, React Router, `motion/react`, Three.js + `@react-three/fiber` + `@react-three/drei` (lazy), TanStack Query for loading/error/retry/refetch, Zod for client validation, one styling approach (CSS variables or Tailwind). Structure: `src/services/`, `src/demo-data/`, `src/features/{landing,auth,gallery,wall,pottery,account,admin}`, `src/components/`, `src/styles/`.
- Code must be readable and explainable (small components, plain names, short comments on the dither wrapper, aspect-ratio framing, ring layout math, carving texture generation, date-window logic, conflict handling, checkout validation).

## 14. Order of work (app must run after each step)

1. Inspect files; print seed structure, image sizes, what exists in the workspace and what you will keep or remove.
2. Remove any backend code (section 0), confirm `npm run dev` works.
3. Tokens, fonts, new logo, BrandBar, global dreamy background, layouts, base components.
4. Services + demo data + `API_CONTRACT.md`.
5. Landing (existing hero unchanged + fixes).
6. Auth and role-aware routes.
7. Browse gallery, `ItemDetailModal`, `CheckoutDialog`, buy flow (first full vertical slice).
8. Customer dashboard, wall booking, pottery request/edit.
9. Admin.
10. Galaxy 3D gallery (ring, reflections, auto-rotate, pottery with carvings, wall art, section switcher) wired to the same modal and checkout.
11. Polish, accessibility, responsive, performance; fix console errors and dead buttons.
12. README (`npm install && npm run dev`, frontend-only note), `FRONTEND_NOTES.md` (file map and per-feature explanations for interview prep).

If time runs short, finish steps 1 to 9 polished and tell me honestly what is left of step 10; a half-working 3D mode must never be the only way to buy.

## 15. Acceptance checklist (run it, then report each item with what you saw; include screenshots at 1440, 1024 and 390 px for landing, Browse, modal (painting and pottery), booking, pottery request, dashboard, 3D gallery, admin)

- [ ] No server/database code or dependencies remain; only `npm install && npm run dev` is needed
- [ ] New eclipse logo is big, top-left only, fully visible and never overlapped on every page
- [ ] Landing shows only logo, title, tagline, the unchanged AI Studio hero and the two stacked buttons with identical effects; tagline large, new font and color, entirely visible at 360 to 1920 px
- [ ] New fonts and dreamy style applied across customer pages; admin calmer
- [ ] Everything is from the seed (12 paintings with real images/ratios, 5 pottery items, 6 glazes, rate from data); no invented pottery prices
- [ ] 3D gallery: no walls, dark starfield, reflections, all 12 paintings visible with true shapes, sold ones marked, auto-rotate toggle, section switcher, controls card
- [ ] Pottery: names visible, earthy colors (no bright red), carved designs visible, glaze picker works
- [ ] Clicking any painting or pottery item (3D, Browse, `/pottery`) opens the split details pop-up with all details; `p-012` and the tall portraits display correctly
- [ ] Buying asks for shipping details, validates them, flips the item to Sold everywhere, shows the address in My Orders and admin Orders; 409 and signed-out/admin cases handled
- [ ] Wall booking (7 to 90 days, 10 to 500 sq ft, rate × size, address, date-taken handling) and pottery request (1 to 12, 14 days, edit/cancel only while requested) work
- [ ] Dashboard cancel rules (orders while placed, bookings until 3 days before, pottery while requested) work
- [ ] Admin: counts, add/edit available paintings, confirm/decline bookings, accept/decline pottery, read-only orders and activity, no cancel or customer actions
- [ ] Loading, empty, error, 401/403/404/409 states exist on every data screen; reduced-motion, keyboard and mobile work; WebGL failure falls back to Browse; no console errors
