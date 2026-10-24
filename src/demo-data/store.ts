// TEMPORARY FRONTEND DEMO DATA: no server, no database. To be replaced by the real backend (Codex).

import seedData from '../../seedData/seed.json';
import {
  Painting,
  PotteryItem,
  Glaze,
  MuralConfig,
  Order,
  WallBooking,
  PotteryRequest,
  ActivityItem,
  User,
  AdminMetrics,
  ShippingAddress
} from '../api/types';

// Currency formatting with Indian grouping (e.g. ₹24,500)
export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: seedData.currency,
    maximumFractionDigits: 0
  }).format(val);
}

// Asia/Kolkata date helper
export function getKolkataDate(): Date {
  const now = new Date();
  const kolkataTimeString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(kolkataTimeString);
}

export function formatDateToKolkata(date: Date): string {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function resolvePaintingImageUrl(imageUrl: string): string {
  const cleanPath = imageUrl.replace(/^\/+/, '');
  return cleanPath.startsWith('seed/') ? `/${cleanPath}` : `/seed/${cleanPath}`;
}

export function isDateWithinRange(dateStr: string, minDays: number, maxDays: number): boolean {
  const todayStr = formatDateToKolkata(getKolkataDate());
  const minDateStr = addDaysToDate(todayStr, minDays);
  const maxDateStr = addDaysToDate(todayStr, maxDays);
  return dateStr >= minDateStr && dateStr <= maxDateStr;
}

const STORAGE_KEY = 'obsura_demo_state_v2';

export interface DemoState {
  paintings: Painting[];
  potteryItems: PotteryItem[];
  glazes: Glaze[];
  muralConfig: MuralConfig;
  orders: Order[];
  bookings: WallBooking[];
  potteryRequests: PotteryRequest[];
  activity: ActivityItem[];
  currentUser: User | null;
}

class DemoStore {
  private state: DemoState;

  // Diagnostic parameters (active only when ?dev=1 is used)
  public devConfig = {
    latencyMs: 150,
    forceError: false,
    emptyData: false
  };

  constructor() {
    this.state = this.loadState();
  }

  private getInitialState(): DemoState {
    const todayStr = formatDateToKolkata(getKolkataDate());

    // Paintings from seed: p-004 and p-009 are initially sold
    const paintings: Painting[] = seedData.paintings.map((p) => ({
      id: p.id,
      title: p.title,
      artist: p.artist,
      description: p.description,
      price: p.price,
      imageUrl: resolvePaintingImageUrl(p.imageUrl),
      status: (p.id === 'p-004' || p.id === 'p-009') ? 'sold' : (p.status as 'available' | 'sold')
    }));

    // Initial past orders
    const orders: Order[] = [
      {
        id: 'ord-101',
        paintingId: 'p-004',
        paintingTitle: 'Pattachitra Dashavatara Panel',
        paintingImage: '/seed/images/p-004.jpg',
        userId: 'usr-collector-1',
        customerName: 'Ananya Sharma',
        customerEmail: 'ananya@example.com',
        price: 12000,
        currency: seedData.currency,
        status: 'placed',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        shipping: {
          fullName: 'Ananya Sharma',
          phone: '9876543210',
          line1: 'Flat 402, Lotus Residency, 12th Main',
          line2: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038'
        }
      },
      {
        id: 'ord-102',
        paintingId: 'p-009',
        paintingTitle: 'Pichwai Lotus Pond',
        paintingImage: '/seed/images/p-009.jpg',
        userId: 'usr-collector-2',
        customerName: 'Rohan Verma',
        customerEmail: 'rohan@example.com',
        price: 18000,
        currency: seedData.currency,
        status: 'placed',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        shipping: {
          fullName: 'Rohan Verma',
          phone: '9811223344',
          line1: 'B-14, Civil Lines',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302006'
        }
      }
    ];

    // Initial bookings
    const bookings: WallBooking[] = [
      {
        id: 'wb-201',
        userId: 'usr-collector-1',
        customerName: 'Ananya Sharma',
        customerEmail: 'ananya@example.com',
        date: addDaysToDate(todayStr, 14),
        sizeSqFt: 120,
        address: '402 Lotus Residency, Indiranagar, Bengaluru, Karnataka 560038',
        ratePerSqFt: seedData.mural.ratePerSqFt,
        totalPrice: 120 * (seedData.mural.ratePerSqFt),
        currency: seedData.currency,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'wb-202',
        userId: 'usr-collector-2',
        customerName: 'Rohan Verma',
        customerEmail: 'rohan@example.com',
        date: addDaysToDate(todayStr, 22),
        sizeSqFt: 85,
        address: 'B-14 Civil Lines, Jaipur, Rajasthan 302006',
        ratePerSqFt: seedData.mural.ratePerSqFt,
        totalPrice: 85 * (seedData.mural.ratePerSqFt),
        currency: seedData.currency,
        status: 'requested',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];

    // Initial pottery requests
    const potteryRequests: PotteryRequest[] = [
      {
        id: 'pr-301',
        userId: 'usr-collector-1',
        customerName: 'Ananya Sharma',
        customerEmail: 'ananya@example.com',
        itemId: 'i-02',
        itemName: 'Surahi (water jug)',
        glazeId: 'g-04',
        glazeName: 'Indigo Blue',
        quantity: 2,
        neededByDate: addDaysToDate(todayStr, 20),
        status: 'requested',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'pr-302',
        userId: 'usr-collector-2',
        customerName: 'Rohan Verma',
        customerEmail: 'rohan@example.com',
        itemId: 'i-01',
        itemName: 'Kulhad (clay cup)',
        glazeId: 'g-02',
        glazeName: 'Haldi Yellow',
        quantity: 6,
        neededByDate: addDaysToDate(todayStr, 18),
        status: 'accepted',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ];

    const activity: ActivityItem[] = [
      {
        id: 'act-1',
        type: 'order',
        title: 'Painting Acquired',
        description: 'Ananya Sharma acquired "Pattachitra Dashavatara Panel" (p-004)',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'act-2',
        type: 'booking',
        title: 'Mural Confirmed',
        description: 'Mural commission confirmed for date ' + addDaysToDate(todayStr, 14),
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'act-3',
        type: 'pottery',
        title: 'Pottery Commission Requested',
        description: 'Surahi (water jug) × 2 requested in Indigo Blue',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];

    return {
      paintings,
      potteryItems: seedData.potteryItems as PotteryItem[],
      glazes: seedData.glazes as Glaze[],
      muralConfig: { ratePerSqFt: seedData.mural.ratePerSqFt, currency: seedData.currency },
      orders,
      bookings,
      potteryRequests,
      activity,
      currentUser: null
    };
  }

  private loadState(): DemoState {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored) as DemoState;
        state.paintings = state.paintings.map((painting) => ({ ...painting, imageUrl: resolvePaintingImageUrl(painting.imageUrl) }));
        return state;
      }
    } catch {}
    const initial = this.getInitialState();
    this.saveState(initial);
    return initial;
  }

  private saveState(state: DemoState) {
    this.state = state;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  public resetToSeed() {
    sessionStorage.removeItem(STORAGE_KEY);
    this.state = this.getInitialState();
    this.saveState(this.state);
  }

  public initStore(_force?: boolean) {
    this.resetToSeed();
  }

  private async delay(): Promise<void> {
    if (this.devConfig.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.devConfig.latencyMs));
    }
    if (this.devConfig.forceError) {
      throw { status: 500, error: { code: 'INTERNAL_ERROR', message: 'Simulated 500 Internal Server Failure' } };
    }
  }

  // --- Auth & Session ---
  async getCurrentUser(): Promise<User | null> {
    await this.delay();
    return this.state.currentUser;
  }

  setCurrentUser(user: User | null) {
    this.state.currentUser = user;
    this.saveState(this.state);
  }

  async login(email: string, pass: string): Promise<User> {
    await this.delay();
    if (email === 'ananya@example.com' && pass.length >= 6) {
      const customerUser: User = {
        id: 'usr-collector-1',
        name: 'Ananya Sharma',
        email: 'ananya@example.com',
        role: 'customer'
      };
      this.state.currentUser = customerUser;
      this.saveState(this.state);
      return customerUser;
    }

    if (pass.length < 6) {
      throw { status: 422, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters' } };
    }

    const defaultCustomer: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'customer'
    };
    this.state.currentUser = defaultCustomer;
    this.saveState(this.state);
    return defaultCustomer;
  }

  async signup(name: string, email: string, pass: string): Promise<User> {
    await this.delay();
    const fields: Record<string, string> = {};
    if (!name.trim()) fields.name = 'Full name is required';
    if (!email.includes('@')) fields.email = 'Valid email address is required';
    if (pass.length < 6) fields.password = 'Password must be at least 6 characters';

    if (Object.keys(fields).length > 0) {
      throw { status: 422, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields } };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'customer'
    };
    this.state.currentUser = newUser;
    this.saveState(this.state);
    return newUser;
  }

  async logout(): Promise<void> {
    await this.delay();
    this.state.currentUser = null;
    this.saveState(this.state);
  }

  // --- Paintings ---
  async listPaintings(): Promise<Painting[]> {
    await this.delay();
    if (this.devConfig.emptyData) return [];
    return [...this.state.paintings];
  }

  async getPainting(id: string): Promise<Painting> {
    await this.delay();
    const p = this.state.paintings.find((x) => x.id === id);
    if (!p) {
      throw { status: 404, error: { code: 'PAINTING_NOT_FOUND', message: `Painting ${id} not found` } };
    }
    return { ...p };
  }

  async buyPainting(paintingId: string, shipping: ShippingAddress): Promise<{ order: Order; painting: Painting }> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) {
      throw { status: 401, error: { code: 'UNAUTHORIZED', message: 'Authentication required to acquire an original artwork' } };
    }
    if (user.role === 'studio') {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'Curators cannot acquire original paintings from studio inventory' } };
    }

    // Validation
    const fields: Record<string, string> = {};
    if (!shipping.fullName?.trim()) fields.fullName = 'Full name is required';
    if (!shipping.phone || !/^[6-9]\d{9}$/.test(shipping.phone.trim())) {
      fields.phone = 'Valid 10-digit Indian phone number starting with 6-9 is required';
    }
    if (!shipping.line1?.trim()) fields.line1 = 'Address line 1 is required';
    if (!shipping.city?.trim()) fields.city = 'City is required';
    if (!shipping.state?.trim()) fields.state = 'State is required';
    if (!shipping.pincode || !/^\d{6}$/.test(shipping.pincode.trim())) {
      fields.pincode = 'Valid 6-digit Indian PIN code is required';
    }

    if (Object.keys(fields).length > 0) {
      throw { status: 422, error: { code: 'VALIDATION_ERROR', message: 'Shipping details are invalid', fields } };
    }

    const paintingIndex = this.state.paintings.findIndex((p) => p.id === paintingId);
    if (paintingIndex === -1) {
      throw { status: 404, error: { code: 'NOT_FOUND', message: 'Artwork not found' } };
    }

    const painting = this.state.paintings[paintingIndex];
    if (painting.status === 'sold') {
      throw {
        status: 409,
        error: {
          code: 'PAINTING_SOLD',
          message: 'This original painting has just found its home and is no longer available.'
        }
      };
    }

    // Mark as sold
    painting.status = 'sold';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      paintingId: painting.id,
      paintingTitle: painting.title,
      paintingImage: painting.imageUrl,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      price: painting.price,
      currency: seedData.currency,
      status: 'placed',
      createdAt: new Date().toISOString(),
      shipping
    };

    this.state.orders.unshift(newOrder);

    this.state.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'order',
      title: 'Painting Acquired',
      description: `${user.name} acquired "${painting.title}" (${painting.id})`,
      createdAt: new Date().toISOString()
    });

    this.saveState(this.state);
    return { order: newOrder, painting: { ...painting } };
  }

  async cancelOrder(orderId: string): Promise<Order> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) throw { status: 401, error: { code: 'UNAUTHORIZED', message: 'Please sign in' } };

    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) throw { status: 404, error: { code: 'NOT_FOUND', message: 'Order not found' } };

    if (user.role === 'studio') {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'Admin audit log is immutable: orders cannot be cancelled by admin' } };
    }

    if (order.userId !== user.id) {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'You can only cancel your own orders' } };
    }

    if (order.status === 'cancelled') {
      throw { status: 409, error: { code: 'ALREADY_CANCELLED', message: 'Order is already cancelled' } };
    }

    order.status = 'cancelled';

    // Restore painting availability
    const painting = this.state.paintings.find((p) => p.id === order.paintingId);
    if (painting) {
      painting.status = 'available';
    }

    this.state.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'order',
      title: 'Order Cancelled',
      description: `${user.name} cancelled acquisition of "${order.paintingTitle}" (restored to gallery)`,
      createdAt: new Date().toISOString()
    });

    this.saveState(this.state);
    return { ...order };
  }

  // --- Pottery ---
  async listPotteryItems(): Promise<PotteryItem[]> {
    await this.delay();
    return [...this.state.potteryItems];
  }

  async listGlazes(): Promise<Glaze[]> {
    await this.delay();
    return [...this.state.glazes];
  }

  async listPotteryRequests(): Promise<PotteryRequest[]> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) return [];
    if (user.role === 'studio') {
      return [...this.state.potteryRequests];
    }
    return this.state.potteryRequests.filter((r) => r.userId === user.id);
  }

  async createPotteryRequest(data: {
    itemId: string;
    glazeId: string;
    quantity: number;
    neededByDate: string;
    notes?: string;
  }): Promise<PotteryRequest> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) throw { status: 401, error: { code: 'UNAUTHORIZED', message: 'Sign in to request custom pottery' } };
    if (user.role === 'studio') {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'Admins cannot place commission requests' } };
    }

    const item = this.state.potteryItems.find((i) => i.id === data.itemId);
    const glaze = this.state.glazes.find((g) => g.id === data.glazeId);

    const fields: Record<string, string> = {};
    if (!item) fields.itemId = 'Please select a valid pottery item';
    if (!glaze) fields.glazeId = 'Please select an authentic glaze finish';
    if (!data.quantity || data.quantity < 1 || data.quantity > 12) {
      fields.quantity = 'Quantity must be between 1 and 12 pieces';
    }
    if ((data.notes?.length || 0) > 240) fields.notes = 'Custom details must be 240 characters or fewer';

    const todayStr = formatDateToKolkata(getKolkataDate());
    const minNeededDate = addDaysToDate(todayStr, 14);
    if (!data.neededByDate || data.neededByDate < minNeededDate) {
      fields.neededByDate = `Studio requires at least 14 days of curing and firing (${minNeededDate} onwards)`;
    }

    if (Object.keys(fields).length > 0) {
      throw { status: 422, error: { code: 'VALIDATION_ERROR', message: 'Pottery request validation failed', fields } };
    }

    const newRequest: PotteryRequest = {
      id: `pr-${Date.now()}`,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      itemId: data.itemId,
      itemName: item!.name,
      glazeId: data.glazeId,
      glazeName: glaze!.name,
      quantity: data.quantity,
      neededByDate: data.neededByDate,
      notes: data.notes?.trim() || undefined,
      status: 'requested',
      createdAt: new Date().toISOString()
    };

    this.state.potteryRequests.unshift(newRequest);
    this.state.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'pottery',
      title: 'New Pottery Commission',
      description: `${user.name} requested ${data.quantity}× ${item!.name} in ${glaze!.name}`,
      createdAt: new Date().toISOString()
    });

    this.saveState(this.state);
    return newRequest;
  }

  async updatePotteryRequest(id: string, data: {
    itemId: string;
    glazeId: string;
    quantity: number;
    neededByDate: string;
    notes?: string;
  }): Promise<PotteryRequest> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) throw { status: 401, error: { code: 'UNAUTHORIZED', message: 'Please sign in' } };

    const req = this.state.potteryRequests.find((r) => r.id === id);
    if (!req) throw { status: 404, error: { code: 'NOT_FOUND', message: 'Commission request not found' } };

    if (req.userId !== user.id) {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'You can only edit your own requests' } };
    }

    if (req.status !== 'requested') {
      throw {
        status: 409,
        error: { code: 'REQUEST_LOCKED', message: `Request is already ${req.status} and cannot be modified` }
      };
    }

    const item = this.state.potteryItems.find((i) => i.id === data.itemId);
    const glaze = this.state.glazes.find((g) => g.id === data.glazeId);
    if ((data.notes?.length || 0) > 240) throw { status: 422, error: { code: 'VALIDATION_ERROR', message: 'Custom details must be 240 characters or fewer' } };
    if (data.quantity < 1 || data.quantity > 12) {
      throw { status: 422, error: { code: 'VALIDATION_ERROR', message: 'Quantity must be between 1 and 12' } };
    }

    req.itemId = data.itemId;
    req.itemName = item?.name || req.itemName;
    req.glazeId = data.glazeId;
    req.glazeName = glaze?.name || req.glazeName;
    req.quantity = data.quantity;
    req.neededByDate = data.neededByDate;
    req.notes = data.notes?.trim() || undefined;

    this.saveState(this.state);
    return { ...req };
  }

  async cancelPotteryRequest(id: string): Promise<PotteryRequest> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) throw { status: 401, error: { code: 'UNAUTHORIZED', message: 'Please sign in' } };

    const req = this.state.potteryRequests.find((r) => r.id === id);
    if (!req) throw { status: 404, error: { code: 'NOT_FOUND', message: 'Request not found' } };

    if (req.userId !== user.id) {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'You can only cancel your own requests' } };
    }

    if (req.status !== 'requested') {
      throw {
        status: 409,
        error: { code: 'CANNOT_CANCEL', message: `Cannot cancel a request with status "${req.status}"` }
      };
    }

    req.status = 'cancelled';
    this.saveState(this.state);
    return { ...req };
  }

  async updatePotteryStatus(id: string, status: 'accepted' | 'declined'): Promise<PotteryRequest> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user || (user.role !== 'studio')) {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'Admin role required' } };
    }

    const req = this.state.potteryRequests.find((r) => r.id === id);
    if (!req) throw { status: 404, error: { code: 'NOT_FOUND', message: 'Request not found' } };

    if (req.status !== 'requested') {
      throw { status: 409, error: { code: 'INVALID_STATUS', message: 'Only requests in "requested" state can be approved or declined' } };
    }

    req.status = status;
    this.state.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'pottery',
      title: `Pottery Commission ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
      description: `Studio ${status} pottery request ${req.id} (${req.itemName})`,
      createdAt: new Date().toISOString()
    });

    this.saveState(this.state);
    return { ...req };
  }

  // --- Mural Wall Bookings ---
  async getMuralConfig(): Promise<MuralConfig> {
    await this.delay();
    return { ...this.state.muralConfig };
  }

  async getUnavailableDates(): Promise<string[]> {
    await this.delay();
    // Dates with active ('requested' or 'confirmed') bookings
    return this.state.bookings
      .filter((b) => b.status === 'requested' || b.status === 'confirmed')
      .map((b) => b.date);
  }

  async createBooking(data: {
    date: string;
    sizeSqFt: number;
    address: string;
  }): Promise<WallBooking> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) throw { status: 401, error: { code: 'UNAUTHORIZED', message: 'Please sign in to book a mural commission' } };
    if (user.role === 'studio') {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'Curators cannot book murals' } };
    }

    const fields: Record<string, string> = {};

    if (!isDateWithinRange(data.date, 7, 90)) {
      const todayStr = formatDateToKolkata(getKolkataDate());
      fields.date = `Mural bookings must be scheduled between 7 and 90 days in advance (${addDaysToDate(todayStr, 7)} to ${addDaysToDate(todayStr, 90)})`;
    }

    if (!data.sizeSqFt || data.sizeSqFt < 10 || data.sizeSqFt > 500) {
      fields.sizeSqFt = 'Mural wall area must be between 10 and 500 square feet';
    }

    if (!data.address || data.address.trim().length < 10) {
      fields.address = 'Full on-site project address is required (minimum 10 characters)';
    }

    if (Object.keys(fields).length > 0) {
      throw { status: 422, error: { code: 'VALIDATION_ERROR', message: 'Booking validation failed', fields } };
    }

    // Check date conflict (409)
    const activeDateConflict = this.state.bookings.find(
      (b) => b.date === data.date && (b.status === 'requested' || b.status === 'confirmed')
    );

    if (activeDateConflict) {
      throw {
        status: 409,
        error: {
          code: 'DATE_ALREADY_BOOKED',
          message: 'Someone just booked that date. Please select another date from the calendar.'
        }
      };
    }

    const rate = this.state.muralConfig.ratePerSqFt;
    const total = data.sizeSqFt * rate;

    const newBooking: WallBooking = {
      id: `wb-${Date.now()}`,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      date: data.date,
      sizeSqFt: data.sizeSqFt,
      address: data.address.trim(),
      ratePerSqFt: rate,
      totalPrice: total,
      currency: seedData.currency,
      status: 'requested',
      createdAt: new Date().toISOString()
    };

    this.state.bookings.unshift(newBooking);
    this.state.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'booking',
      title: 'Mural Date Requested',
      description: `${user.name} requested mural commission for ${data.date} (${data.sizeSqFt} sq ft)`,
      createdAt: new Date().toISOString()
    });

    this.saveState(this.state);
    return newBooking;
  }

  async listBookings(): Promise<WallBooking[]> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) return [];
    if (user.role === 'studio') {
      return [...this.state.bookings];
    }
    return this.state.bookings.filter((b) => b.userId === user.id);
  }

  async cancelBooking(bookingId: string): Promise<WallBooking> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) throw { status: 401, error: { code: 'UNAUTHORIZED', message: 'Please sign in' } };

    const booking = this.state.bookings.find((b) => b.id === bookingId);
    if (!booking) throw { status: 404, error: { code: 'NOT_FOUND', message: 'Booking not found' } };

    if (booking.userId !== user.id) {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'You can only cancel your own bookings' } };
    }

    if (booking.status === 'cancelled' || booking.status === 'declined') {
      throw { status: 409, error: { code: 'ALREADY_INACTIVE', message: `Booking is already ${booking.status}` } };
    }

    // 3-day cancellation window check
    const todayStr = formatDateToKolkata(getKolkataDate());
    const lockDateStr = addDaysToDate(booking.date, -3);
    if (todayStr > lockDateStr) {
      throw {
        status: 422,
        error: {
          code: 'CANCELLATION_WINDOW_CLOSED',
          message: 'Cancellation closed 3 days before your date. Studio materials and scaffolding are committed.'
        }
      };
    }

    booking.status = 'cancelled';
    this.saveState(this.state);
    return { ...booking };
  }

  async updateBookingStatus(id: string, status: 'confirmed' | 'declined'): Promise<WallBooking> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user || (user.role !== 'studio')) {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'Admin role required' } };
    }

    const booking = this.state.bookings.find((b) => b.id === id);
    if (!booking) throw { status: 404, error: { code: 'NOT_FOUND', message: 'Booking not found' } };

    if (booking.status !== 'requested') {
      throw { status: 409, error: { code: 'INVALID_STATUS', message: 'Only bookings in "requested" state can be confirmed or declined' } };
    }

    booking.status = status;
    this.state.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'booking',
      title: `Mural Booking ${status === 'confirmed' ? 'Confirmed' : 'Declined'}`,
      description: `Studio ${status} mural on ${booking.date} for ${booking.customerName}`,
      createdAt: new Date().toISOString()
    });

    this.saveState(this.state);
    return { ...booking };
  }

  // --- Admin Desk Operations ---
  async addPainting(data: Omit<Painting, 'id' | 'status'>): Promise<Painting> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user || (user.role !== 'studio')) {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'Admin role required' } };
    }

    const id = `p-${String(this.state.paintings.length + 1).padStart(3, '0')}`;
    const newPainting: Painting = {
      id,
      title: data.title.trim(),
      artist: data.artist.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      imageUrl: data.imageUrl.trim() || '/seed/images/p-001.jpg',
      status: 'available'
    };

    this.state.paintings.unshift(newPainting);
    this.saveState(this.state);
    return newPainting;
  }

  async updatePainting(id: string, data: Partial<Painting>): Promise<Painting> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user || (user.role !== 'studio')) {
      throw { status: 403, error: { code: 'FORBIDDEN', message: 'Admin role required' } };
    }

    const painting = this.state.paintings.find((p) => p.id === id);
    if (!painting) throw { status: 404, error: { code: 'NOT_FOUND', message: 'Painting not found' } };

    if (painting.status === 'sold') {
      throw {
        status: 409,
        error: {
          code: 'PAINTING_LOCKED',
          message: 'This original artwork has been acquired by a collector and cannot be edited.'
        }
      };
    }

    if (data.title !== undefined) painting.title = data.title.trim();
    if (data.artist !== undefined) painting.artist = data.artist.trim();
    if (data.description !== undefined) painting.description = data.description.trim();
    if (data.price !== undefined) painting.price = Number(data.price);
    if (data.imageUrl !== undefined) painting.imageUrl = data.imageUrl.trim();

    this.saveState(this.state);
    return { ...painting };
  }

  async listOrders(): Promise<Order[]> {
    await this.delay();
    const user = this.state.currentUser;
    if (!user) return [];
    if (user.role === 'studio') {
      return [...this.state.orders];
    }
    return this.state.orders.filter((o) => o.userId === user.id);
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    await this.delay();
    const availablePaintings = this.state.paintings.filter((p) => p.status === 'available').length;
    const soldPaintings = this.state.paintings.filter((p) => p.status === 'sold').length;

    const ordersPlaced = this.state.orders.filter((o) => o.status === 'placed').length;
    const ordersCancelled = this.state.orders.filter((o) => o.status === 'cancelled').length;

    const bookingsRequested = this.state.bookings.filter((b) => b.status === 'requested').length;
    const bookingsConfirmed = this.state.bookings.filter((b) => b.status === 'confirmed').length;
    const bookingsDeclined = this.state.bookings.filter((b) => b.status === 'declined').length;
    const bookingsCancelled = this.state.bookings.filter((b) => b.status === 'cancelled').length;

    const potteryRequested = this.state.potteryRequests.filter((r) => r.status === 'requested').length;
    const potteryAccepted = this.state.potteryRequests.filter((r) => r.status === 'accepted').length;
    const potteryDeclined = this.state.potteryRequests.filter((r) => r.status === 'declined').length;
    const potteryCancelled = this.state.potteryRequests.filter((r) => r.status === 'cancelled').length;

    return {
      paintings: {
        total: this.state.paintings.length,
        available: availablePaintings,
        sold: soldPaintings
      },
      orders: {
        total: this.state.orders.length,
        placed: ordersPlaced,
        cancelled: ordersCancelled
      },
      bookings: {
        total: this.state.bookings.length,
        requested: bookingsRequested,
        confirmed: bookingsConfirmed,
        declined: bookingsDeclined,
        cancelled: bookingsCancelled
      },
      pottery: {
        total: this.state.potteryRequests.length,
        requested: potteryRequested,
        accepted: potteryAccepted,
        declined: potteryDeclined,
        cancelled: potteryCancelled
      }
    };
  }

  async getActivity(): Promise<ActivityItem[]> {
    await this.delay();
    return [...this.state.activity];
  }

  // Helpers for testing 409 conflict simulations via DevPanel
  simulatePaintingSoldElsewhere(paintingId: string) {
    const p = this.state.paintings.find((x) => x.id === paintingId);
    if (p) {
      p.status = 'sold';
      this.saveState(this.state);
    }
  }

  simulateDateBookedElsewhere(dateStr: string) {
    const conflictBooking: WallBooking = {
      id: `wb-sim-${Date.now()}`,
      userId: 'usr-sim-other',
      customerName: 'Karan Mehra',
      customerEmail: 'karan@example.com',
      date: dateStr,
      sizeSqFt: 100,
      address: '22 MG Road, Bengaluru',
      ratePerSqFt: 150,
      totalPrice: 15000,
      currency: seedData.currency,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    this.state.bookings.unshift(conflictBooking);
    this.saveState(this.state);
  }

  switchRole(role: 'customer' | 'studio') {
    if (role === 'studio') {
      this.state.currentUser = {
        id: 'usr-admin-studio',
        name: 'Studio Curator',
        email: 'studio@artstudio.in',
        role: 'studio'
      };
    } else {
      this.state.currentUser = {
        id: 'usr-collector-1',
        name: 'Ananya Sharma',
        email: 'ananya@example.com',
        role: 'customer'
      };
    }
    this.saveState(this.state);
  }
}

export const demoStore = new DemoStore();
