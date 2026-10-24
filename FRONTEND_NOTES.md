# OBSURA — Frontend Engineering Architecture & Interview Notes

## 1. Architectural Philosophy & Layered Separation

```text
src/
├── services/               # Clean service layer (THE ONLY entry point for UI components)
│   └── index.ts            # authService, listPaintings, buyPainting, mural & pottery actions
├── demo-data/              # TEMPORARY FRONTEND DEMO DATA (In-memory + sessionStorage)
│   └── store.ts            # Business rules, Kolkata timezone math, ₹ formatINR, 409 conflict simulators
├── api/
│   ├── client.ts           # Backward-compatible API facade delegating to services
│   └── types.ts            # TypeScript domain types & API error payloads
├── components/
│   ├── BrandBar.tsx        # Persistent top bar (≥56px desktop, 40px mobile, 28px padding)
│   ├── Logo.tsx            # Eclipse SVG with iridescent light disc & 4-point sparkle
│   ├── HeroButton.tsx      # Shared button with dot-matrix fill & angle-tracking iridescent border
│   ├── ItemDetailModal.tsx # Shared split modal matching details-modal-target.png
│   ├── CheckoutDialog.tsx  # 3-step checkout with full Indian address & PIN code validation
│   ├── Pottery3DCanvas.tsx # Procedural lathe pottery with Indian relief bump maps & 6 glazes
│   ├── DevPanel.tsx        # Diagnostic panel rendered ONLY when ?dev=1 is in URL
│   └── ErrorPages.tsx      # Branded 404 Void and 403 Restricted Atelier views
├── features/
│   ├── landing/            # LandingPage with DitherVeil hero & stacked HeroButtons
│   ├── gallery/            # Walk3DView (Galaxy exhibition), BrowseView (2D grid), PaintingDetailPage
│   ├── pottery/            # PotteryPage (5 silhouettes, 6 glazes, 14-day rule, edit/cancel)
│   ├── wall/               # WallBookingPage (4-step wizard, 7-90 day calendar, ₹150/sq ft slider)
│   ├── account/            # AccountDashboardPage (orders with shipping, mural bookings, pottery)
│   └── admin/              # AdminDashboard, AdminPaintings, AdminBookings, AdminPottery, AdminOrders, AdminActivity
├── App.tsx                 # Route declarations & role guards
└── index.css               # Design tokens, Fraunces/Manrope typography, aurora drift
```

### The "Zero Backend" Rule & Clean Transition to Codex
- **Zero Server / Database**: No Express routes, Prisma ORM, or SQL tables are running.
- **Header Contract**: All mock persistence lives in `src/demo-data/store.ts` headed with:
  `// TEMPORARY FRONTEND DEMO DATA: no server, no database. To be replaced by the real backend (Codex).`
- **Service Isolation**: Screens (`LandingPage`, `GalleryPage`, `WallBookingPage`, etc.) call functions in `src/services/`. When Codex builds the real backend, only `src/services/` will be updated to make real `fetch()` calls. All UI components remain untouched.

---

## 2. Technical Decisions & Deep Dive Topics

### 1. Pure Three.js over React Three Fiber (R3F) for React 19
- **Context**: The project runs on **React 19** (`react@^19.0.1`).
- **Challenge**: Many React Three Fiber wrappers have peer dependency mismatches with React 19.
- **Solution**: Built both `Walk3DView.tsx` (Galaxy Exhibition) and `Pottery3DCanvas.tsx` using pure `three@^0.186.1`.
- **Engineering Benefits**:
  - Direct frame-rate control with smooth lerping.
  - Zero component re-render overhead inside the render loop.
  - Deterministic WebGL resource disposal (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`, renderer teardown) inside the `useEffect` cleanup hook, preventing memory and WebGL context leaks.

### 2. Orbiting Galaxy Exhibition (`galaxy-gallery-target.png`)
- **Dark Starfield**: Radial star particle cloud with twinkling opacity against deep obsidian `#05060A`.
- **Glossy Reflective Floor**: High-metalness, low-roughness circular ground plane with inverted cloned reflections beneath the plane for maximum visual fidelity without the heavy GPU penalty of dynamic planar reflection passes.
- **Aspect Ratio Preservation in 3D**:
  - The 12 seed paintings have varied aspect ratios (e.g., tall portrait `p-003` at 0.68, `p-004` at 0.64, `p-011` at 0.66, and landscape `p-012` at 1.50).
  - Rather than forcing fixed aspect ratios, each picture frame mesh dynamically computes its geometry width and height based on the painting texture aspect ratio:
    `const meshWidth = 2.4 * aspect; const meshHeight = 2.4;`
- **Pottery Constellation on Plinths**: 5 distinct earthenware vessels set on elevated circular pedestals with glowing rim lights and floating title chips.
- **Wall Art Plane**: An interactive 3D mural preview surface that synchronizes with the dynamic size slider.

### 3. Procedural Indian Relief Carvings & Earthenware Glazes
- **Relief Motifs**: Instead of requiring megabytes of static 3D textures, `Pottery3DCanvas.tsx` dynamically generates high-resolution 2D bump maps using the HTML5 Canvas API:
  - **Zigzag Chevron**: Waveform ridges reminiscent of Rajasthani terracotta.
  - **Paisley (Ambi/Kalka)**: Graceful curved teardrop motifs found in Indian textile and clay heritage.
  - **Jaali Lattice**: Geometric pierced stone and earthenware screen patterns.
  - **Lotus Petals**: Sacred floral relief rings.
  - **Fluting**: Classical vertical column grooves.
- **6 Earthy Glazes**:
  - `#9C4A32` (Terracotta Red)
  - `#C9962E` (Ochre Earth)
  - `#6B7A3A` (Forest Moss)
  - `#3F4F73` (Deep Cobalt)
  - `#CBB08A` (Raw Clay)
  - `#2E2B28` (Slate Charcoal)
- Materials utilize `MeshStandardMaterial` with tuned roughness (0.45–0.70) and bumpScale (0.04–0.08) to capture tactile earthenware warmth.

### 4. Zero-Plumbing Discipline
- To preserve high visual polish for production demonstrations, dev panels, mock credentials, and simulation toggles are completely hidden by default.
- `DevPanel.tsx` checks `new URLSearchParams(window.location.search).get('dev') === '1'`.
- Only when `?dev=1` is explicitly present does the floating diagnostic drawer render, allowing engineers to simulate 409 painting conflicts, 409 date conflicts, network latency, and 401 token expiry.

### 5. Role-Based Access Control (RBAC) Matrix

| Action | Visitor | Customer | Studio Admin |
| :--- | :---: | :---: | :---: |
| View Gallery (2D & 3D) | ✅ | ✅ | ✅ |
| Acquire Painting | ❌ (Redirects to Login) | ✅ | ❌ (Admins cannot purchase) |
| Book Mural | ❌ (Redirects to Login) | ✅ | ❌ (Admins cannot book) |
| Request Custom Pottery | ❌ (Redirects to Login) | ✅ | ❌ (Admins cannot request) |
| Cancel Order | ❌ | ✅ (Restores painting to `available`) | ❌ (Read-only sales audit) |
| Manage Inventory | ❌ | ❌ | ✅ (Add / Edit available) |
| Confirm / Decline Mural | ❌ | ❌ | ✅ |
| Accept / Decline Pottery | ❌ | ❌ | ✅ |
| View Sales Audit | ❌ | ❌ | ✅ (Preserves shipping address) |
| View Activity Log | ❌ | ❌ | ✅ |
