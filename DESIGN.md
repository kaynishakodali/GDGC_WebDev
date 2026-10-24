# ARTOPIA design and implementation notes

## Visual direction

ARTOPIA uses a contemporary Indian editorial gallery language: warm paper ivory and deep brown-black grounds with vermilion, rani pink, marigold, peacock blue, indigo, mehendi, and haldi accents. Display serif headings balance the clean sans-serif interface. Hand-drawn arch, sun, jaali, and vessel motifs are interface decorations, not product imagery. The supplied painting files remain the only painting artwork; they are not replaced or edited.

The hero dither treatment uses the supplied `p-001` painting from the local seed image folder. The landing page also loads featured entries from the API, so titles, artists, prices, availability, and images stay tied to actual catalogue rows. Sections without supplied photography use CSS/SVG.

## Motion and accessibility

The site uses short transform/opacity transitions, card lift and image zoom, animated landing reveals, floating studio tools, page-enter transitions, and a desktop-only tracking cursor ring/dot. The native pointer remains in place for accuracy. Coarse pointers and `prefers-reduced-motion` disable the tracking cursor and major decorative motion. Focus-visible outlines and semantic controls remain available to keyboard users.

## Data and backend

The project keeps its React/TypeScript + Vite frontend, Express API, Prisma models, and PostgreSQL database. `seedData/seed.json` contains 12 paintings (`p-001`–`p-012`), five pottery forms (`i-01`–`i-05`), six glaze options (`g-01`–`g-06`), currency INR, and a ₹150/sq ft mural rate. Painting photos are the corresponding `public/seed/images/p-###.jpg` assets in the web build; originals under `seedData/` are preserved. There are no supplied pottery or mural photos.

The new bag stores only unique painting IDs in local browser storage. It does not create reservations. Checkout calls the existing order API for each unique work; the server locks and rechecks painting availability before it creates the order. Auctions remain on their existing bid/winner path and are excluded from the bag.

## Access and security

Customers can purchase, bid, create their own commissions, view their own records, and use eligible cancellation/edit actions. Studio staff access protected inventory and review workflows. The API exposes exactly two roles: `customer` and `studio`. Existing database rows with the legacy `admin` enum are normalized to `studio` in public API responses; the database values are preserved, while staff-only routes continue to authorize legacy accounts. Public registration assigns only the customer role. Sessions are opaque and stored server-side; input schemas, ownership checks, and origin/CSRF validation are enforced by the API.

Mural and painting conflict checks are handled on the server. Mural rates come from `AppConfig`; client values are not trusted. Pottery has no fabricated fixed price because the seed does not provide one. No payment gateway is configured; orders are acquisition records, not payment captures.

## Known boundaries

- Checkout creates an order record without charging a payment method.
- The artwork bag checks out unique paintings one at a time because the current order model is one painting per order.
- Supplied images do not include pottery or mural photography.
- The database retains a legacy `admin` enum for compatibility; API responses expose only `customer` or `studio`.
- `GEMINI_API_KEY` and `APP_URL` remain optional existing integration settings and are not involved in core catalogue or checkout workflows.
