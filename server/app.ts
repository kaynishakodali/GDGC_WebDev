import 'dotenv/config';
import express, { type ErrorRequestHandler, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { z, ZodError } from 'zod';
import { Prisma, Role, PaintingStatus, PaintingSaleMode, OrderStatus, BookingStatus, PotteryRequestStatus, ActivityType } from '@prisma/client';
import { prisma } from './db.js';
import { calculateMuralTotal, canPurchasePainting, dateRangeError, hasAnyRole, kolkataDate, ownsResource, shiftIsoDate } from './policy.js';
import { createSessionToken, hashSessionToken, isSessionExpired, sessionExpiry } from './session.js';

const app = express();
const COOKIE = 'obsura_session';
const SESSION_HOURS = 8;
const origins = (process.env.APP_ORIGIN ?? 'http://localhost:3000,http://127.0.0.1:3000').split(',').map((v) => v.trim()).filter(Boolean);
const isProd = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(cors({ origin(origin, done) { if (!origin || origins.includes(origin)) return done(null, true); return done(new HttpError(403, 'ORIGIN_BLOCKED', 'Request origin is not allowed.')); }, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '32kb', strict: true }));
app.use((req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin && !origins.includes(req.headers.origin)) return next(new HttpError(403, 'ORIGIN_BLOCKED', 'Request origin is not allowed.'));
  next();
});

class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>) { super(message); }
}
type AuthUser = { id: string; name: string; email: string; role: Role };
const userPublic = ({ id, name, email, role }: AuthUser) => ({ id, name, email, role: role === Role.customer ? Role.customer : Role.studio });
const parse = <T>(schema: z.ZodType<T>, input: unknown): T => schema.parse(input);
const asyncRoute = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => { void handler(req, res, next).catch(next); };
function cookieValue(req: Request, name: string) {
  const found = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!found) return undefined;
  try { return decodeURIComponent(found.slice(name.length + 1)); } catch { return undefined; }
}
async function optionalUserId(req: Request) {
  const raw = cookieValue(req, COOKIE);
  if (!raw) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: hashSessionToken(raw) }, select: { userId: true, expiresAt: true } });
  return session && !isSessionExpired(session.expiresAt) ? session.userId : null;
}
function setSessionCookie(res: Response, value: string, maxAge: number) {
  const secure = isProd ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`);
}
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const raw = cookieValue(req, COOKIE);
  if (!raw) return next(new HttpError(401, 'UNAUTHORIZED', 'Please sign in to continue.'));
  void prisma.session.findUnique({ where: { tokenHash: hashSessionToken(raw) }, include: { user: true } }).then((session) => {
    if (!session || isSessionExpired(session.expiresAt)) {
      if (session) void prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      return next(new HttpError(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.'));
    }
    res.locals.user = userPublic(session.user);
    next();
  }).catch(next);
}
function allowRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.user) return next(new HttpError(401, 'UNAUTHORIZED', 'Please sign in to continue.'));
    if (!hasAnyRole((res.locals.user as AuthUser).role, roles)) return next(new HttpError(403, 'FORBIDDEN', 'You do not have access to this resource.'));
    next();
  };
}
const customerOnly = [requireAuth, allowRoles(Role.customer)];
const studioOnly = [requireAuth, allowRoles(Role.studio, Role.admin)];
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many sign-in attempts. Please try again later.' } } });
const idParam = z.object({ id: z.string().min(1).max(100) });
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateSchema = z.string().regex(datePattern).refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value, 'Use a valid YYYY-MM-DD date.');
const signupSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254), password: z.string().min(10).max(128) });
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) });
const paintingSchema = z.object({ title: z.string().trim().min(1).max(160), artist: z.string().trim().min(1).max(120), description: z.string().trim().min(1).max(3000), price: z.number().int().nonnegative().max(100_000_000), imageUrl: z.string().trim().min(1).max(1000).refine((value) => /^https:\/\/[^\s]+$/i.test(value) || /^\/?(?:seed\/)?images\/[a-z0-9._-]+$/i.test(value), 'Use an HTTPS image URL or a supplied seed image path.'), status: z.enum(['available', 'sold']).optional(), saleMode: z.nativeEnum(PaintingSaleMode).optional(), auctionEndsAt: z.string().datetime({ offset: true }).nullable().optional() });
const bidSchema = z.object({ amount: z.number().int().positive().max(100_000_000) });
const shippingSchema = z.object({ fullName: z.string().trim().min(1).max(120), phone: z.string().trim().regex(/^[6-9]\d{9}$/), line1: z.string().trim().min(1).max(250), line2: z.string().trim().max(250).optional(), street: z.string().trim().max(250).optional(), city: z.string().trim().min(1).max(100), state: z.string().trim().min(1).max(100), pincode: z.string().trim().regex(/^\d{6}$/) });
const orderSchema = z.object({ paintingId: z.string().min(1).max(100), shipping: shippingSchema });
const bookingSchema = z.object({ date: dateSchema, sizeSqFt: z.number().int().min(10).max(500), address: z.string().trim().min(10).max(1000) });
const potterySchema = z.object({ itemId: z.string().min(1).max(100), glazeId: z.string().min(1).max(100), quantity: z.number().int().min(1).max(12), neededByDate: dateSchema, notes: z.string().max(240).optional() });
const pageQuery = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(50) });
function pageMeta(page: number, limit: number, total: number) { return { page, limit, total, pages: Math.ceil(total / limit) }; }
function imagePath(value: string) { if (/^https:\/\//i.test(value)) return value; const clean = value.replace(/^\/+/, ''); return clean.startsWith('seed/') ? `/${clean}` : `/seed/${clean}`; }
async function activity(tx: Prisma.TransactionClient, type: ActivityType, title: string, description: string, actorId?: string) { await tx.activity.create({ data: { type, title, description, actorId } }); }
async function lockBookingDate(tx: Prisma.TransactionClient, date: string) {
  await tx.$queryRaw<{ locked: string }[]>`WITH lock AS MATERIALIZED (SELECT pg_advisory_xact_lock(hashtext(${date}))) SELECT 'locked'::text AS locked FROM lock`;
}
function currentUser(res: Response) { return res.locals.user as AuthUser; }
function publicOrder(order: any) { return { ...order, paintingTitle: order.painting?.title, paintingImage: order.painting?.imageUrl, userId: order.customerId, price: order.pricePaid }; }

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post('/api/auth/signup', authLimiter, asyncRoute(async (req, res) => {
  const data = parse(signupSchema, req.body); const email = data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({ data: { name: data.name, email, passwordHash, role: Role.customer } });
  const token = createSessionToken(); const expiresAt = sessionExpiry(Date.now(), SESSION_HOURS);
  await prisma.session.create({ data: { tokenHash: hashSessionToken(token), userId: user.id, expiresAt } }); setSessionCookie(res, token, SESSION_HOURS * 3600);
  res.status(201).json({ user: userPublic(user) });
}));
app.post('/api/auth/login', authLimiter, asyncRoute(async (req, res) => {
  const data = parse(loginSchema, req.body); const email = data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  const matches = user ? await bcrypt.compare(data.password, user.passwordHash) : await bcrypt.compare(data.password, '$2a$12$C6UzMDM.H6dfI/f/IKcEe.7.hxyVOUwMnU/G6aO6E0qpC/NTaW3MC');
  if (!user || !matches) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  const token = createSessionToken(); const expiresAt = sessionExpiry(Date.now(), SESSION_HOURS);
  await prisma.session.create({ data: { tokenHash: hashSessionToken(token), userId: user.id, expiresAt } }); setSessionCookie(res, token, SESSION_HOURS * 3600);
  res.json({ user: userPublic(user) });
}));
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: currentUser(res) }));
app.post('/api/auth/logout', asyncRoute(async (req, res) => {
  const token = cookieValue(req, COOKIE); if (token) await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  setSessionCookie(res, '', 0); res.json({ success: true });
}));

app.get('/api/paintings', asyncRoute(async (req, res) => {
  const query = pageQuery.extend({ status: z.enum(['available', 'sold']).optional(), sort: z.enum(['price-asc', 'price-desc']).optional() }).parse(req.query);
  const where = query.status ? { status: query.status as PaintingStatus } : {};
  const userId = await optionalUserId(req);
  const [total, rows] = await prisma.$transaction([prisma.painting.count({ where }), prisma.painting.findMany({ where, include: { bids: { orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }], take: 1, select: { amount: true, customerId: true } }, _count: { select: { bids: true } } }, orderBy: query.sort ? { price: query.sort === 'price-asc' ? 'asc' : 'desc' } : { createdAt: 'asc' }, skip: (query.page - 1) * query.limit, take: query.limit })]);
  res.json({ paintings: rows.map(({ bids, _count, ...row }) => ({ ...row, imageUrl: imagePath(row.imageUrl), currentBid: bids[0]?.amount ?? null, bidCount: _count.bids, auctionOpen: row.saleMode === PaintingSaleMode.auction && row.status === PaintingStatus.available && Boolean(row.auctionEndsAt && row.auctionEndsAt > new Date()), isHighestBidder: Boolean(userId && bids[0]?.customerId === userId) })), pagination: pageMeta(query.page, query.limit, total) });
}));
app.get('/api/paintings/:id', asyncRoute(async (req, res) => { const { id } = parse(idParam, req.params); const [painting, userId] = await Promise.all([prisma.painting.findUnique({ where: { id }, include: { bids: { orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }], take: 1, select: { amount: true, customerId: true } }, _count: { select: { bids: true } } } }), optionalUserId(req)]); if (!painting) throw new HttpError(404, 'NOT_FOUND', 'Artwork not found.'); const { bids, _count, ...row } = painting; res.json({ painting: { ...row, imageUrl: imagePath(row.imageUrl), currentBid: bids[0]?.amount ?? null, bidCount: _count.bids, auctionOpen: row.saleMode === PaintingSaleMode.auction && row.status === PaintingStatus.available && Boolean(row.auctionEndsAt && row.auctionEndsAt > new Date()), isHighestBidder: Boolean(userId && bids[0]?.customerId === userId) } }); }));
app.post('/api/paintings', ...studioOnly, asyncRoute(async (req, res) => {
  const data = parse(paintingSchema, req.body); const id = `p-${randomBytes(5).toString('hex')}`;
  const saleMode = data.saleMode ?? PaintingSaleMode.fixed; const auctionEndsAt = saleMode === PaintingSaleMode.auction && data.auctionEndsAt ? new Date(data.auctionEndsAt) : null;
  if (saleMode === PaintingSaleMode.auction && (data.price < 1 || !auctionEndsAt || auctionEndsAt <= new Date())) throw new HttpError(422, 'VALIDATION_ERROR', 'Auction paintings need a positive opening bid and a future end time.', { ...(data.price < 1 ? { price: 'Opening bid must be at least ₹1.' } : {}), ...(!auctionEndsAt || auctionEndsAt <= new Date() ? { auctionEndsAt: 'Choose a future auction end time.' } : {}) });
  const painting = await prisma.$transaction(async (tx) => { const created = await tx.painting.create({ data: { title: data.title, artist: data.artist, description: data.description, price: data.price, imageUrl: data.imageUrl.replace(/^\/seed\//, ''), saleMode, auctionEndsAt, id, status: PaintingStatus.available } }); await activity(tx, ActivityType.painting, 'Painting Added', `${currentUser(res).name} added "${created.title}"`, currentUser(res).id); return created; });
  res.status(201).json({ painting: { ...painting, imageUrl: imagePath(painting.imageUrl) } });
}));
app.patch('/api/paintings/:id', ...studioOnly, asyncRoute(async (req, res) => {
  const { id } = parse(idParam, req.params); const data = paintingSchema.partial().parse(req.body);
  const existing = await prisma.painting.findUnique({ where: { id } }); if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Painting not found.');
  if (existing.status === PaintingStatus.sold) throw new HttpError(409, 'PAINTING_LOCKED', 'Sold artwork cannot be edited.');
  if (data.status === 'available') { const activeOrder = await prisma.order.findFirst({ where: { paintingId: id, status: OrderStatus.placed } }); if (activeOrder) throw new HttpError(409, 'PAINTING_LOCKED', 'An active order prevents making this artwork available.'); }
  const saleMode = data.saleMode ?? existing.saleMode;
  const auctionEndsAt = data.auctionEndsAt === undefined ? existing.auctionEndsAt : data.auctionEndsAt ? new Date(data.auctionEndsAt) : null;
  if (saleMode === PaintingSaleMode.auction && ((data.price ?? existing.price) < 1 || !auctionEndsAt || auctionEndsAt <= new Date())) throw new HttpError(422, 'VALIDATION_ERROR', 'Auction paintings need a positive opening bid and a future end time.', { ...((data.price ?? existing.price) < 1 ? { price: 'Opening bid must be at least ₹1.' } : {}), ...(!auctionEndsAt || auctionEndsAt <= new Date() ? { auctionEndsAt: 'Choose a future auction end time.' } : {}) });
  const auctionSettingsChanged = (data.saleMode !== undefined && data.saleMode !== existing.saleMode) || (data.price !== undefined && data.price !== existing.price) || (data.auctionEndsAt !== undefined && (data.auctionEndsAt ? new Date(data.auctionEndsAt).getTime() : null) !== (existing.auctionEndsAt?.getTime() ?? null));
  if (auctionSettingsChanged) {
    const bidCount = await prisma.bid.count({ where: { paintingId: id } });
    if (bidCount > 0) throw new HttpError(409, 'AUCTION_LOCKED', 'Auction settings and opening price cannot change after the first bid.');
  }
  const { auctionEndsAt: _incomingEnd, ...fields } = data;
  const painting = await prisma.painting.update({ where: { id }, data: { ...fields, saleMode, auctionEndsAt: saleMode === PaintingSaleMode.auction ? auctionEndsAt : null, ...(data.imageUrl ? { imageUrl: data.imageUrl.replace(/^\/seed\//, '') } : {}) } });
  res.json({ painting: { ...painting, imageUrl: imagePath(painting.imageUrl) } });
}));
app.post('/api/paintings/:id/bids', ...customerOnly, asyncRoute(async (req, res) => {
  const { id } = parse(idParam, req.params); const { amount } = parse(bidSchema, req.body); const user = currentUser(res);
  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "Painting" WHERE "id" = ${id} FOR UPDATE`;
    const painting = await tx.painting.findUnique({ where: { id } }); if (!painting) throw new HttpError(404, 'NOT_FOUND', 'Artwork not found.');
    if (painting.status !== PaintingStatus.available || painting.saleMode !== PaintingSaleMode.auction || !painting.auctionEndsAt || painting.auctionEndsAt <= new Date()) throw new HttpError(409, 'AUCTION_CLOSED', 'This auction is not open for bids.');
    const highest = await tx.bid.findFirst({ where: { paintingId: id }, orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }] });
    const minimum = highest ? highest.amount + 1 : painting.price;
    if (amount < minimum) throw new HttpError(422, 'VALIDATION_ERROR', `Your bid must be at least ${minimum}.`, { amount: `Enter at least ₹${minimum}.` });
    const bid = await tx.bid.create({ data: { paintingId: id, customerId: user.id, amount } });
    await activity(tx, ActivityType.painting, 'New Painting Bid', `${user.name} placed a bid on "${painting.title}"`, user.id);
    const bidCount = await tx.bid.count({ where: { paintingId: id } });
    return { painting, bid, bidCount };
  });
  res.status(201).json({ bid: result.bid, painting: { ...result.painting, imageUrl: imagePath(result.painting.imageUrl), currentBid: result.bid.amount, bidCount: result.bidCount, auctionOpen: true, isHighestBidder: true } });
}));

app.get('/api/pottery/items', asyncRoute(async (_req, res) => res.json({ potteryItems: await prisma.potteryItem.findMany({ where: { active: true }, orderBy: { id: 'asc' }, select: { id: true, name: true } }) })));
app.get('/api/glazes', asyncRoute(async (_req, res) => res.json({ glazes: await prisma.glaze.findMany({ where: { active: true }, orderBy: { id: 'asc' }, select: { id: true, name: true } }) })));
app.post('/api/pottery/items', ...studioOnly, asyncRoute(async (req, res) => { const schema = z.object({ id: z.string().min(1).max(60), name: z.string().trim().min(1).max(120) }); const data = parse(schema, req.body); const item = await prisma.potteryItem.create({ data }); res.status(201).json({ item }); }));
app.patch('/api/pottery/items/:id', ...studioOnly, asyncRoute(async (req, res) => { const { id } = parse(idParam, req.params); const data = parse(z.object({ name: z.string().trim().min(1).max(120).optional(), active: z.boolean().optional() }), req.body); const item = await prisma.potteryItem.update({ where: { id }, data }); res.json({ item }); }));
app.post('/api/glazes', ...studioOnly, asyncRoute(async (req, res) => { const data = parse(z.object({ id: z.string().min(1).max(60), name: z.string().trim().min(1).max(120) }), req.body); const glaze = await prisma.glaze.create({ data }); res.status(201).json({ glaze }); }));
app.patch('/api/glazes/:id', ...studioOnly, asyncRoute(async (req, res) => { const { id } = parse(idParam, req.params); const data = parse(z.object({ name: z.string().trim().min(1).max(120).optional(), active: z.boolean().optional() }), req.body); const glaze = await prisma.glaze.update({ where: { id }, data }); res.json({ glaze }); }));

app.get('/api/mural/config', asyncRoute(async (_req, res) => { const config = await prisma.appConfig.findUnique({ where: { id: 'default' } }); res.json({ ratePerSqFt: config?.muralRate ?? 150, currency: config?.currency ?? 'INR' }); }));
app.get('/api/bookings/unavailable-dates', asyncRoute(async (_req, res) => { const rows = await prisma.wallBooking.findMany({ where: { status: { in: [BookingStatus.requested, BookingStatus.confirmed] } }, select: { date: true }, distinct: ['date'] }); res.json({ unavailableDates: rows.map((row) => row.date) }); }));
app.get('/api/bookings', requireAuth, asyncRoute(async (_req, res) => { const user = currentUser(res); const bookings = await prisma.wallBooking.findMany({ where: user.role === Role.customer ? { customerId: user.id } : {}, orderBy: { createdAt: 'desc' } }); res.json({ bookings: bookings.map((b) => ({ ...b, userId: b.customerId })) }); }));
app.post('/api/bookings', ...customerOnly, asyncRoute(async (req, res) => {
  const data = parse(bookingSchema, req.body); const dateError = dateRangeError(data.date, 7, 90); if (dateError) throw new HttpError(422, 'VALIDATION_ERROR', 'Booking validation failed.', { date: dateError });
  const user = currentUser(res); const config = await prisma.appConfig.findUnique({ where: { id: 'default' } }); const rate = config?.muralRate ?? 150;
  const booking = await prisma.$transaction(async (tx) => {
    await lockBookingDate(tx, data.date);
    const conflict = await tx.wallBooking.findFirst({ where: { date: data.date, status: { in: [BookingStatus.requested, BookingStatus.confirmed] } } }); if (conflict) throw new HttpError(409, 'DATE_UNAVAILABLE', 'Someone just booked that date. Please select another date from the calendar.');
    const created = await tx.wallBooking.create({ data: { ...data, customerId: user.id, customerName: user.name, customerEmail: user.email, ratePerSqFt: rate, totalPrice: calculateMuralTotal(data.sizeSqFt, rate), currency: config?.currency ?? 'INR' } });
    await activity(tx, ActivityType.booking, 'Mural Date Requested', `${user.name} requested a mural for ${data.date} (${data.sizeSqFt} sq ft)`, user.id); return created;
  }); res.status(201).json({ booking: { ...booking, userId: booking.customerId } });
}));
app.post('/api/bookings/:id/cancel', ...customerOnly, asyncRoute(async (req, res) => {
  const { id } = parse(idParam, req.params); const user = currentUser(res); const booking = await prisma.wallBooking.findUnique({ where: { id } });
  if (!booking) throw new HttpError(404, 'NOT_FOUND', 'Booking not found.'); if (!ownsResource(user.id, booking.customerId)) throw new HttpError(403, 'FORBIDDEN', 'You can only cancel your own bookings.');
  if (booking.status !== BookingStatus.requested && booking.status !== BookingStatus.confirmed) throw new HttpError(409, 'ALREADY_INACTIVE', `Booking is already ${booking.status}.`);
  if (kolkataDate() > shiftIsoDate(booking.date, -3)) throw new HttpError(409, 'CANCELLATION_CLOSED', 'Cancellation closed 3 days before your date.');
  const updated = await prisma.wallBooking.update({ where: { id }, data: { status: BookingStatus.cancelled } }); res.json({ booking: { ...updated, userId: updated.customerId } });
}));
for (const status of [BookingStatus.confirmed, BookingStatus.declined] as const) app.post(`/api/bookings/:id/${status === BookingStatus.confirmed ? 'confirm' : 'decline'}`, ...studioOnly, asyncRoute(async (req, res) => {
  const { id } = parse(idParam, req.params); const booking = await prisma.wallBooking.findUnique({ where: { id } }); if (!booking) throw new HttpError(404, 'NOT_FOUND', 'Booking not found.'); if (booking.status !== BookingStatus.requested) throw new HttpError(409, 'INVALID_STATUS', 'Only requested bookings can be reviewed.');
  const updated = await prisma.$transaction(async (tx) => { const row = await tx.wallBooking.update({ where: { id }, data: { status } }); await activity(tx, ActivityType.booking, `Mural Booking ${status}`, `Studio ${status} mural on ${row.date} for ${row.customerName}`, currentUser(res).id); return row; }); res.json({ booking: { ...updated, userId: updated.customerId } });
}));

app.get('/api/pottery-requests', requireAuth, asyncRoute(async (_req, res) => { const user = currentUser(res); const rows = await prisma.potteryRequest.findMany({ where: user.role === Role.customer ? { customerId: user.id } : {}, orderBy: { createdAt: 'desc' } }); res.json({ requests: rows.map((row) => ({ ...row, userId: row.customerId })) }); }));
async function potteryInput(data: z.infer<typeof potterySchema>) {
  const errors: Record<string, string> = {}; const dateError = dateRangeError(data.neededByDate, 14, 3650); if (dateError) errors.neededByDate = 'Studio requires at least 14 days for curing and firing.';
  const [item, glaze] = await Promise.all([prisma.potteryItem.findFirst({ where: { id: data.itemId, active: true } }), prisma.glaze.findFirst({ where: { id: data.glazeId, active: true } })]);
  if (!item) errors.itemId = 'Please select a valid pottery item.'; if (!glaze) errors.glazeId = 'Please select an available glaze.';
  if (Object.keys(errors).length) throw new HttpError(422, 'VALIDATION_ERROR', 'Pottery request validation failed.', errors);
  return { data, item: item!, glaze: glaze! };
}
app.post('/api/pottery-requests', ...customerOnly, asyncRoute(async (req, res) => {
  const validated = await potteryInput(parse(potterySchema, req.body)); const user = currentUser(res); const { data, item, glaze } = validated;
  const row = await prisma.$transaction(async (tx) => { const created = await tx.potteryRequest.create({ data: { customerId: user.id, customerName: user.name, customerEmail: user.email, itemId: item.id, itemName: item.name, glazeId: glaze.id, glazeName: glaze.name, quantity: data.quantity, neededByDate: data.neededByDate, notes: data.notes?.trim() || null } }); await activity(tx, ActivityType.pottery, 'New Pottery Commission', `${user.name} requested ${data.quantity}× ${item.name} in ${glaze.name}`, user.id); return created; }); res.status(201).json({ request: { ...row, userId: row.customerId } });
}));
app.patch('/api/pottery-requests/:id', ...customerOnly, asyncRoute(async (req, res) => {
  const { id } = parse(idParam, req.params); const user = currentUser(res); const existing = await prisma.potteryRequest.findUnique({ where: { id } }); if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Commission request not found.'); if (!ownsResource(user.id, existing.customerId)) throw new HttpError(403, 'FORBIDDEN', 'You can only edit your own requests.'); if (existing.status !== PotteryRequestStatus.requested) throw new HttpError(409, 'REQUEST_LOCKED', 'This request is already being handled and cannot be edited.');
  const validated = await potteryInput(parse(potterySchema, req.body)); const { data, item, glaze } = validated; const row = await prisma.potteryRequest.update({ where: { id }, data: { itemId: item.id, itemName: item.name, glazeId: glaze.id, glazeName: glaze.name, quantity: data.quantity, neededByDate: data.neededByDate, notes: data.notes?.trim() || null } }); res.json({ request: { ...row, userId: row.customerId } });
}));
app.post('/api/pottery-requests/:id/cancel', ...customerOnly, asyncRoute(async (req, res) => { const { id } = parse(idParam, req.params); const user = currentUser(res); const row = await prisma.potteryRequest.findUnique({ where: { id } }); if (!row) throw new HttpError(404, 'NOT_FOUND', 'Request not found.'); if (!ownsResource(user.id, row.customerId)) throw new HttpError(403, 'FORBIDDEN', 'You can only cancel your own requests.'); if (row.status !== PotteryRequestStatus.requested) throw new HttpError(409, 'CANNOT_CANCEL', `Cannot cancel a request with status "${row.status}".`); const updated = await prisma.potteryRequest.update({ where: { id }, data: { status: PotteryRequestStatus.cancelled } }); res.json({ request: { ...updated, userId: updated.customerId } }); }));
for (const status of [PotteryRequestStatus.accepted, PotteryRequestStatus.declined] as const) app.post(`/api/pottery-requests/:id/${status === PotteryRequestStatus.accepted ? 'accept' : 'decline'}`, ...studioOnly, asyncRoute(async (req, res) => {
  const { id } = parse(idParam, req.params); const existing = await prisma.potteryRequest.findUnique({ where: { id } }); if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Request not found.'); if (existing.status !== PotteryRequestStatus.requested) throw new HttpError(409, 'INVALID_STATUS', 'Only requested commissions can be reviewed.'); const updated = await prisma.$transaction(async (tx) => { const row = await tx.potteryRequest.update({ where: { id }, data: { status } }); await activity(tx, ActivityType.pottery, `Pottery Commission ${status}`, `Studio ${status} pottery request ${row.id} (${row.itemName})`, currentUser(res).id); return row; }); res.json({ request: { ...updated, userId: updated.customerId } });
}));

app.get('/api/orders', requireAuth, asyncRoute(async (_req, res) => { const user = currentUser(res); const rows = await prisma.order.findMany({ where: user.role === Role.customer ? { customerId: user.id } : {}, include: { painting: true }, orderBy: { createdAt: 'desc' } }); res.json({ orders: rows.map((row) => ({ ...publicOrder(row), painting: { ...row.painting, imageUrl: imagePath(row.painting.imageUrl) }, paintingImage: imagePath(row.painting.imageUrl) })) }); }));
app.post('/api/orders', ...customerOnly, asyncRoute(async (req, res) => {
  const data = parse(orderSchema, req.body); const user = currentUser(res);
  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "Painting" WHERE "id" = ${data.paintingId} FOR UPDATE`;
    const painting = await tx.painting.findUnique({ where: { id: data.paintingId } }); if (!painting) throw new HttpError(404, 'NOT_FOUND', 'Artwork not found.');
    const activeOrder = await tx.order.findFirst({ where: { paintingId: painting.id, status: OrderStatus.placed } }); if (!canPurchasePainting(painting.status, Boolean(activeOrder))) throw new HttpError(409, 'PAINTING_SOLD', 'This painting is no longer available.');
    let finalPrice = painting.price;
    if (painting.saleMode === PaintingSaleMode.auction) {
      if (!painting.auctionEndsAt || painting.auctionEndsAt > new Date()) throw new HttpError(409, 'AUCTION_OPEN', 'This painting is still in its bidding period.');
      const highest = await tx.bid.findFirst({ where: { paintingId: painting.id }, orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }] });
      if (!highest) throw new HttpError(409, 'AUCTION_NO_BIDS', 'This auction ended without bids.');
      if (highest.customerId !== user.id) throw new HttpError(403, 'AUCTION_NOT_WINNER', 'Only the highest bidder can complete this acquisition.');
      finalPrice = highest.amount;
    }
    const order = await tx.order.create({ data: { customerId: user.id, paintingId: painting.id, customerName: user.name, customerEmail: user.email, pricePaid: finalPrice, shipping: data.shipping as Prisma.InputJsonValue }, include: { painting: true } });
    await tx.painting.update({ where: { id: painting.id }, data: { status: PaintingStatus.sold } }); await activity(tx, ActivityType.order, 'Painting Acquired', `${user.name} acquired "${painting.title}" (${painting.id})`, user.id); return order;
  });
  const order = { ...publicOrder(result), painting: { ...result.painting, imageUrl: imagePath(result.painting.imageUrl) }, paintingImage: imagePath(result.painting.imageUrl) };
  res.status(201).json({ order, painting: { ...result.painting, imageUrl: imagePath(result.painting.imageUrl), status: PaintingStatus.sold } });
}));
app.post('/api/orders/:id/cancel', ...customerOnly, asyncRoute(async (req, res) => {
  const { id } = parse(idParam, req.params); const user = currentUser(res);
  const order = await prisma.$transaction(async (tx) => { const row = await tx.order.findUnique({ where: { id }, include: { painting: true } }); if (!row) throw new HttpError(404, 'NOT_FOUND', 'Order not found.'); if (!ownsResource(user.id, row.customerId)) throw new HttpError(403, 'FORBIDDEN', 'You can only cancel your own orders.'); if (row.status !== OrderStatus.placed) throw new HttpError(409, 'ALREADY_CANCELLED', 'Order is already cancelled.'); const updated = await tx.order.update({ where: { id }, data: { status: OrderStatus.cancelled }, include: { painting: true } }); const anotherActive = await tx.order.findFirst({ where: { paintingId: row.paintingId, status: OrderStatus.placed } }); if (!anotherActive) await tx.painting.update({ where: { id: row.paintingId }, data: { status: PaintingStatus.available } }); await activity(tx, ActivityType.order, 'Order Cancelled', `${user.name} cancelled acquisition of "${row.painting.title}"`, user.id); return updated; }); res.json({ order: publicOrder(order) });
}));

app.get('/api/account', ...customerOnly, asyncRoute(async (_req, res) => { const user = currentUser(res); const [orders, bookings, potteryRequests] = await Promise.all([prisma.order.count({ where: { customerId: user.id } }), prisma.wallBooking.count({ where: { customerId: user.id } }), prisma.potteryRequest.count({ where: { customerId: user.id } })]); res.json({ user, history: { orders, bookings, potteryRequests } }); }));
app.patch('/api/account', ...customerOnly, asyncRoute(async (req, res) => { const data = parse(z.object({ name: z.string().trim().min(2).max(100).optional() }).strict(), req.body); const user = currentUser(res); const updated = await prisma.user.update({ where: { id: user.id }, data }); res.json({ user: userPublic(updated) }); }));
app.get('/api/admin/metrics', ...studioOnly, asyncRoute(async (_req, res) => {
  const [paintings, orders, bookings, pottery] = await Promise.all([prisma.painting.groupBy({ by: ['status'], _count: { _all: true } }), prisma.order.groupBy({ by: ['status'], _count: { _all: true } }), prisma.wallBooking.groupBy({ by: ['status'], _count: { _all: true } }), prisma.potteryRequest.groupBy({ by: ['status'], _count: { _all: true } })]);
  const count = <T extends string>(rows: Array<{ status: T; _count: { _all: number } }>, status: T) => rows.find((row) => row.status === status)?._count._all ?? 0;
  const pAvailable = count(paintings, PaintingStatus.available); const pSold = count(paintings, PaintingStatus.sold); const oPlaced = count(orders, OrderStatus.placed); const oCancelled = count(orders, OrderStatus.cancelled);
  const bRequested = count(bookings, BookingStatus.requested); const bConfirmed = count(bookings, BookingStatus.confirmed); const bDeclined = count(bookings, BookingStatus.declined); const bCancelled = count(bookings, BookingStatus.cancelled);
  const rRequested = count(pottery, PotteryRequestStatus.requested); const rAccepted = count(pottery, PotteryRequestStatus.accepted); const rDeclined = count(pottery, PotteryRequestStatus.declined); const rCancelled = count(pottery, PotteryRequestStatus.cancelled);
  res.json({ paintings: { total: pAvailable + pSold, available: pAvailable, sold: pSold }, orders: { total: oPlaced + oCancelled, placed: oPlaced, cancelled: oCancelled }, bookings: { total: bRequested + bConfirmed + bDeclined + bCancelled, requested: bRequested, confirmed: bConfirmed, declined: bDeclined, cancelled: bCancelled }, pottery: { total: rRequested + rAccepted + rDeclined + rCancelled, requested: rRequested, accepted: rAccepted, declined: rDeclined, cancelled: rCancelled } });
}));
app.get('/api/admin/activity', ...studioOnly, asyncRoute(async (_req, res) => { const rows = await prisma.activity.findMany({ include: { actor: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }); res.json({ activity: rows.map((row) => ({ id: row.id, type: row.type, title: row.title, description: row.description, actor: row.actor?.name, timestamp: row.createdAt.toISOString(), createdAt: row.createdAt.toISOString() })) }); }));

app.use('/api', (_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'API route not found.')));
const errors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const fields: Record<string, string> = {}; for (const issue of error.issues) { const key = String(issue.path[0] ?? 'request'); fields[key] ??= issue.message; }
    res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.', fields } }); return;
  }
  if (error instanceof HttpError) { res.status(error.status).json({ error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) } }); return; }
  if (error instanceof SyntaxError && 'body' in error) { res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' } }); return; }
  if (error?.status === 413) { res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds the 32 KB limit.' } }); return; }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') { res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with that value already exists.' } }); return; }
    if (error.code === 'P2025') { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found.' } }); return; }
  }
  console.error(JSON.stringify({ level: 'error', name: error?.name ?? 'Error', code: error?.code ?? 'UNHANDLED' }));
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred.' } });
};
app.use(errors);

export default app;
