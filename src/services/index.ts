import { demoStore } from '../demo-data/store';
import type { Painting, PotteryItem, Glaze, MuralConfig, Order, WallBooking, PotteryRequest, ActivityItem, User, AdminMetrics, ShippingAddress } from '../api/types';

// Local mock data is opt-in and can never be enabled by a production build.
export const demoMode = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true';

type ApiFailure = { error?: { code?: string; message?: string; fields?: Record<string, string> } };
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: 'include',
      headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers }
    });
  } catch {
    throw { error: { code: 'API_UNAVAILABLE', message: 'The ARTOPIA studio server could not be reached. Start the backend and try again.' } } satisfies ApiFailure;
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw result as ApiFailure;
  return result as T;
}
const body = (value: unknown): string => JSON.stringify(value);
const unwrap = <K extends string, T>(key: K) => (result: Record<K, T>) => result[key];

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    if (demoMode) return demoStore.getCurrentUser();
    try { return (await request<{ user: User }>('/auth/me')).user; }
    catch (error) { if ((error as ApiFailure)?.error?.code === 'UNAUTHORIZED') return null; throw error; }
  },
  async login(email: string, pass: string): Promise<User> {
    if (demoMode) return demoStore.login(email, pass);
    return (await request<{ user: User }>('/auth/login', { method: 'POST', body: body({ email, password: pass }) })).user;
  },
  async signup(name: string, email: string, pass: string): Promise<User> {
    if (demoMode) return demoStore.signup(name, email, pass);
    return (await request<{ user: User }>('/auth/signup', { method: 'POST', body: body({ name, email, password: pass }) })).user;
  },
  async logout(): Promise<void> {
    if (demoMode) return demoStore.logout();
    await request<{ success: boolean }>('/auth/logout', { method: 'POST', body: '{}' });
  }
};

export async function listPaintings(): Promise<Painting[]> { if (demoMode) return demoStore.listPaintings(); return (await request<{ paintings: Painting[] }>('/paintings')).paintings; }
export async function getPainting(id: string): Promise<Painting> { if (demoMode) return demoStore.getPainting(id); return (await request<{ painting: Painting }>(`/paintings/${encodeURIComponent(id)}`)).painting; }
export async function buyPainting(params: { paintingId: string; shipping: ShippingAddress }): Promise<{ order: Order; painting: Painting }> { if (demoMode) return demoStore.buyPainting(params.paintingId, params.shipping); return request('/orders', { method: 'POST', body: body(params) }); }
export async function placePaintingBid(paintingId: string, amount: number): Promise<{ painting: Painting; bid: { id: string; amount: number; createdAt: string } }> { return request(`/paintings/${encodeURIComponent(paintingId)}/bids`, { method: 'POST', body: body({ amount }) }); }
export async function addPainting(data: Omit<Painting, 'id' | 'status'>): Promise<Painting> { if (demoMode) return demoStore.addPainting(data); return (await request<{ painting: Painting }>('/paintings', { method: 'POST', body: body(data) })).painting; }
export async function updatePainting(id: string, data: Partial<Painting>): Promise<Painting> { if (demoMode) return demoStore.updatePainting(id, data); return (await request<{ painting: Painting }>(`/paintings/${encodeURIComponent(id)}`, { method: 'PATCH', body: body(data) })).painting; }

export async function listPotteryItems(): Promise<PotteryItem[]> { if (demoMode) return demoStore.listPotteryItems(); return (await request<{ potteryItems: PotteryItem[] }>('/pottery/items')).potteryItems; }
export async function listGlazes(): Promise<Glaze[]> { if (demoMode) return demoStore.listGlazes(); return (await request<{ glazes: Glaze[] }>('/glazes')).glazes; }
export async function listPotteryRequests(): Promise<PotteryRequest[]> { if (demoMode) return demoStore.listPotteryRequests(); return (await request<{ requests: PotteryRequest[] }>('/pottery-requests')).requests; }
export type PotteryRequestInput = { itemId: string; glazeId: string; quantity: number; neededByDate: string; notes?: string };
export async function createPotteryRequest(data: PotteryRequestInput): Promise<PotteryRequest> { if (demoMode) return demoStore.createPotteryRequest(data); return (await request<{ request: PotteryRequest }>('/pottery-requests', { method: 'POST', body: body(data) })).request; }
export async function updatePotteryRequest(id: string, data: PotteryRequestInput): Promise<PotteryRequest> { if (demoMode) return demoStore.updatePotteryRequest(id, data); return (await request<{ request: PotteryRequest }>(`/pottery-requests/${encodeURIComponent(id)}`, { method: 'PATCH', body: body(data) })).request; }
export async function cancelPotteryRequest(id: string): Promise<PotteryRequest> { if (demoMode) return demoStore.cancelPotteryRequest(id); return (await request<{ request: PotteryRequest }>(`/pottery-requests/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: '{}' })).request; }
export async function updatePotteryStatus(id: string, status: 'accepted' | 'declined'): Promise<PotteryRequest> { if (demoMode) return demoStore.updatePotteryStatus(id, status); return (await request<{ request: PotteryRequest }>(`/pottery-requests/${encodeURIComponent(id)}/${status === 'accepted' ? 'accept' : 'decline'}`, { method: 'POST', body: '{}' })).request; }

export async function getMuralConfig(): Promise<MuralConfig> { if (demoMode) return demoStore.getMuralConfig(); return request('/mural/config'); }
export async function getUnavailableMuralDates(): Promise<string[]> { if (demoMode) return demoStore.getUnavailableDates(); return (await request<{ unavailableDates: string[] }>('/bookings/unavailable-dates')).unavailableDates; }
export async function createMuralBooking(data: { date: string; sizeSqFt: number; address: string }): Promise<WallBooking> { if (demoMode) return demoStore.createBooking(data); return (await request<{ booking: WallBooking }>('/bookings', { method: 'POST', body: body(data) })).booking; }
export async function listMuralBookings(): Promise<WallBooking[]> { if (demoMode) return demoStore.listBookings(); return (await request<{ bookings: WallBooking[] }>('/bookings')).bookings; }
export async function cancelMuralBooking(id: string): Promise<WallBooking> { if (demoMode) return demoStore.cancelBooking(id); return (await request<{ booking: WallBooking }>(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: '{}' })).booking; }
export async function updateMuralStatus(id: string, status: 'confirmed' | 'declined'): Promise<WallBooking> { if (demoMode) return demoStore.updateBookingStatus(id, status); return (await request<{ booking: WallBooking }>(`/bookings/${encodeURIComponent(id)}/${status === 'confirmed' ? 'confirm' : 'decline'}`, { method: 'POST', body: '{}' })).booking; }

export async function listOrders(): Promise<Order[]> { if (demoMode) return demoStore.listOrders(); return (await request<{ orders: Order[] }>('/orders')).orders; }
export async function cancelOrder(id: string): Promise<Order> { if (demoMode) return demoStore.cancelOrder(id); return (await request<{ order: Order }>(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: '{}' })).order; }
export async function getAdminMetrics(): Promise<AdminMetrics> { if (demoMode) return demoStore.getAdminMetrics(); return request('/admin/metrics'); }
export async function getActivityLog(): Promise<ActivityItem[]> { if (demoMode) return demoStore.getActivity(); return (await request<{ activity: ActivityItem[] }>('/admin/activity')).activity; }

export async function getAccountProfile(): Promise<{ user: User; history: { orders: number; bookings: number; potteryRequests: number } }> { return request('/account'); }
export async function updateAccountProfile(name: string): Promise<User> { return (await request<{ user: User }>('/account', { method: 'PATCH', body: body({ name }) })).user; }
