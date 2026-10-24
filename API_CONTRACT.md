# OBSURA — API Contract & Backend Specification

> **Implementation note:** The Express + Prisma backend is implemented in `server/` and `prisma/`. This document records the intended frontend contract; see the routes below and the additions at the end for the running API surface.

This document describes all API endpoints, data models, error formats, and authentication flows expected by the OBSURA frontend application.

## 1. Global Conventions

- **Base URL:** `/api` (or configured via `VITE_API_URL`)
- **Authentication:** Cookie-based session (`credentials: "include"`). The browser sends HTTP-only session cookies on every request.
- **Currency:** `INR` (Indian Rupee ₹). Formatted using Indian numeric grouping.
- **Timezone & Dates:** Date strings are ISO 8601 `YYYY-MM-DD` in the `Asia/Kolkata` timezone. Timestamps are ISO 8601 with UTC offset (`2026-10-24T12:00:00.000Z`).
- **Standard Error Response:**
```json
{
  "error": {
    "code": "PAINTING_SOLD",
    "message": "Human-readable explanation of why this request failed.",
    "fields": {
      "fieldName": "Specific validation failure message"
    }
  }
}
```

---

## 2. Authentication & Sessions

### `GET /api/auth/me`
Returns current authenticated user session or `401 Unauthorized`.
- **Response `200 OK`**:
```json
{
  "user": {
    "id": "usr-123",
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "role": "customer" // or "admin" / "studio"
  }
}
```
- **Response `401 Unauthorized`**:
```json
{
  "error": { "code": "UNAUTHORIZED", "message": "No active session." }
}
```

### `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "studio@artstudio.in",
  "password": "Studio@123"
}
```
- **Response `200 OK`**: `{ "user": { ... } }` and sets session cookie.
- **Response `401 / 422`**: Invalid credentials or validation failure.

### `POST /api/auth/signup`
- **Request Body**:
```json
{
  "name": "Priya Nair",
  "email": "priya@example.com",
  "password": "SecretPassword123"
}
```
- **Response `200 OK`**: `{ "user": { ... } }`

### `POST /api/auth/logout`
- **Response `200 OK`**: `{ "success": true }`

---

## 3. Paintings

### `GET /api/paintings`
- **Query Parameters**:
  - `status`: `"available"` | `"sold"` (optional)
  - `sort`: `"price-asc"` | `"price-desc"` (optional)
- **Response `200 OK`**:
```json
{
  "paintings": [
    {
      "id": "p-001",
      "title": "Madhubani Peacock Garden",
      "artist": "Meera Kumari",
      "description": "Madhubani style. Natural pigments on handmade paper, 45 x 60 cm.",
      "price": 6500,
      "imageUrl": "/seed/images/p-001.jpg",
      "status": "available"
    }
  ]
}
```

### `GET /api/paintings/:id`
- **Response `200 OK`**: `{ "painting": { ... } }`
- **Response `404 Not Found`**: When artwork ID does not exist.

### `POST /api/paintings` (Admin Only)
- **Request Body**: `{ "title": string, "artist": string, "description": string, "price": number, "imageUrl": string }`
- **Response `201 Created`**: `{ "painting": { ... } }`

### `PATCH /api/paintings/:id` (Admin Only)
- **Constraint**: Allowed only if status is `available`.
- **Response `409 Conflict`**: If painting status is `sold`.

---

## 4. Orders (Art Purchases)

### `GET /api/orders`
- Customer: returns caller's own orders.
- Admin: returns all studio orders.
- **Response `200 OK`**: `{ "orders": [ ... ] }`

### `POST /api/orders` (Customer Only)
- **Request Body**: `{ "paintingId": "p-001" }`
- **Business Rule**: Checks painting availability.
- **Response `200 OK`**:
```json
{
  "order": {
    "id": "ord-987",
    "paintingId": "p-001",
    "painting": { ... },
    "customerId": "usr-123",
    "customerName": "Ananya Sharma",
    "customerEmail": "ananya@example.com",
    "pricePaid": 6500,
    "status": "placed",
    "createdAt": "2026-10-24T12:00:00.000Z",
    "updatedAt": "2026-10-24T12:00:00.000Z"
  }
}
```
- **Response `409 Conflict`**: If painting is already sold:
```json
{
  "error": {
    "code": "PAINTING_SOLD",
    "message": "This painting has just been purchased by another art collector. It is no longer available."
  }
}
```

### `POST /api/orders/:id/cancel` (Customer Only)
- **Business Rule**:
  - Customer can only cancel their own order.
  - Can only cancel while status is `placed`.
  - **Cancelling returns the associated painting back to `available` status!**
- **Response `200 OK`**: `{ "order": { ..., "status": "cancelled" } }`

---

## 5. Wall Bookings (Mural Commissions)

### `GET /api/bookings/unavailable-dates`
Returns list of booked calendar dates (`YYYY-MM-DD` in Kolkata time) that are in `requested` or `confirmed` status.
- **Response `200 OK`**: `{ "unavailableDates": ["2026-11-05", "2026-11-14"] }`

### `GET /api/bookings`
- Customer: returns own bookings.
- Admin: returns all studio bookings.
- **Response `200 OK`**: `{ "bookings": [ ... ] }`

### `POST /api/bookings` (Customer Only)
- **Request Body**:
```json
{
  "date": "2026-11-12",
  "sizeSqFt": 150,
  "address": "42 Jubilee Hills, Road No. 36, Hyderabad"
}
```
- **Validation Rules**:
  - `date`: must be between today+7 and today+90 days inclusive.
  - `sizeSqFt`: between 10 and 500 sq ft.
  - `ratePerSqFt`: 150 (read from seed/server).
  - `totalPrice`: `sizeSqFt * 150`.
- **Response `409 Conflict`**: If date is already reserved.
```json
{
  "error": {
    "code": "DATE_UNAVAILABLE",
    "message": "Someone just booked that date. Please select another date from the calendar."
  }
}
```

### `POST /api/bookings/:id/cancel` (Customer Only)
- **Business Rule**: Customer can only cancel if today is **at least 3 days before** the booking date.
- **Response `409 Conflict`**: If within 3 days:
```json
{
  "error": {
    "code": "CANCELLATION_CLOSED",
    "message": "Cancellation closed 3 days before your date."
  }
}
```

### `POST /api/bookings/:id/confirm` & `POST /api/bookings/:id/decline` (Admin Only)
- Can only transition from `requested` status.

---

## 6. Custom Pottery Commissions

### `GET /api/pottery-requests`
- Customer: returns own requests.
- Admin: returns all studio requests.

### `POST /api/pottery-requests` (Customer Only)
- **Request Body**:
```json
{
  "itemId": "i-02",
  "glazeId": "g-04",
  "quantity": 4,
  "neededByDate": "2026-11-20",
  "notes": "Decorative glaze finish"
}
```
- **Validation Rules**:
  - `itemId` must be one of the 5 seed items (Kulhad, Surahi, Matka, Diya set, Gamla).
  - `glazeId` must be one of the 6 seed glazes (Kumkum Red, Haldi Yellow, Mehendi Green, Indigo Blue, Sandalwood Beige, Charcoal Black).
  - `quantity`: 1 to 12.
  - `neededByDate`: at least 14 days from today.

### `PATCH /api/pottery-requests/:id` (Customer Only)
- Allowed **only** while status is `requested`.

### `POST /api/pottery-requests/:id/cancel` (Customer Only)
- Allowed **only** while status is `requested`.

### `POST /api/pottery-requests/:id/accept` & `POST /api/pottery-requests/:id/decline` (Admin Only)
- Allowed **only** while status is `requested`.

---

## 7. Admin Metrics & Audit Activity

### `GET /api/admin/metrics` (Admin Only)
- Returns real counts calculated from data:
```json
{
  "paintings": { "total": 12, "available": 10, "sold": 2 },
  "orders": { "total": 2, "placed": 2, "cancelled": 0 },
  "bookings": { "total": 3, "requested": 1, "confirmed": 1, "declined": 1, "cancelled": 0 },
  "pottery": { "total": 2, "requested": 1, "accepted": 1, "declined": 0, "cancelled": 0 }
}
```

### `GET /api/admin/activity` (Admin Only)

## 8. Additional implemented endpoints

- `GET /api/health` returns `{ "status": "ok", "timestamp": "<ISO timestamp>" }`.
- `GET /api/pottery/items` returns active `{ id, name }` pottery forms. Studio roles can `POST /api/pottery/items` with `{ id, name }` and `PATCH /api/pottery/items/:id` with `{ name?, active? }`.
- `GET /api/glazes` returns active `{ id, name }` glaze options. Studio roles can `POST /api/glazes` with `{ id, name }` and `PATCH /api/glazes/:id` with `{ name?, active? }`.
- `GET /api/mural/config` returns `{ ratePerSqFt, currency }`; mural totals are calculated on the server from the configured rate and submitted area.
- `GET /api/account` (customer) returns `{ user, history: { orders, bookings, potteryRequests } }`; `PATCH /api/account` accepts `{ name }`.

Painting listing accepts `page`, `limit` (1–100), optional `status=available|sold`, and optional `sort=price-asc|price-desc`; the response includes `{ paintings, pagination: { page, limit, total, pages } }`.

Studio actions allow `studio` and `admin` roles. A customer can only read or change their own account, orders, bookings, and pottery requests. Session credentials are HTTP-only, hashed at rest in the `Session` table, expire after eight hours, and are invalidated on logout. Admin credentials are provisioned only from `STUDIO_ADMIN_*` environment variables by the seed command; there is no built-in password.
- Returns chronological real event history with actor names and timestamps.
