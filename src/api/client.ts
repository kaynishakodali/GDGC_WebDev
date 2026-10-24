import * as services from '../services';
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
} from './types';

// API Facade wrapping services
export const api = {
  // Auth
  getCurrentUser: (): Promise<User | null> => services.authService.getCurrentUser(),
  getMe: (): Promise<User | null> => services.authService.getCurrentUser(),
  login: (email: string, pass: string): Promise<User> => services.authService.login(email, pass),
  signup: (name: string, email: string, pass: string): Promise<User> => services.authService.signup(name, email, pass),
  logout: (): Promise<void> => services.authService.logout(),

  // Paintings
  getPaintings: (): Promise<Painting[]> => services.listPaintings(),
  getPaintingById: (id: string): Promise<Painting> => services.getPainting(id),
  buyPainting: (params: { paintingId: string; shipping: ShippingAddress }): Promise<{ order: Order; painting: Painting }> =>
    services.buyPainting(params),
  placePaintingBid: (paintingId: string, amount: number) => services.placePaintingBid(paintingId, amount),
  addPainting: (data: Omit<Painting, 'id' | 'status'>): Promise<Painting> => services.addPainting(data),
  updatePainting: (id: string, data: Partial<Painting>): Promise<Painting> => services.updatePainting(id, data),

  // Pottery
  getPotteryItems: (): Promise<PotteryItem[]> => services.listPotteryItems(),
  getGlazes: (): Promise<Glaze[]> => services.listGlazes(),
  getPotteryRequests: (): Promise<PotteryRequest[]> => services.listPotteryRequests(),
  createPotteryRequest: (data: {
    itemId: string;
    glazeId: string;
    quantity: number;
    neededByDate: string;
    notes?: string;
  }): Promise<PotteryRequest> => services.createPotteryRequest(data),
  updatePotteryRequest: (
    id: string,
    data: { itemId: string; glazeId: string; quantity: number; neededByDate: string; notes?: string }
  ): Promise<PotteryRequest> => services.updatePotteryRequest(id, data),
  cancelPotteryRequest: (id: string): Promise<PotteryRequest> => services.cancelPotteryRequest(id),
  updatePotteryStatus: (id: string, status: 'accepted' | 'declined'): Promise<PotteryRequest> =>
    services.updatePotteryStatus(id, status),
  acceptPotteryRequest: (id: string): Promise<PotteryRequest> => services.updatePotteryStatus(id, 'accepted'),
  declinePotteryRequest: (id: string): Promise<PotteryRequest> => services.updatePotteryStatus(id, 'declined'),

  // Mural Wall Bookings
  getMuralConfig: (): Promise<MuralConfig> => services.getMuralConfig(),
  getUnavailableDates: (): Promise<string[]> => services.getUnavailableMuralDates(),
  createBooking: (data: { date: string; sizeSqFt: number; address: string }): Promise<WallBooking> =>
    services.createMuralBooking(data),
  getBookings: (): Promise<WallBooking[]> => services.listMuralBookings(),
  cancelBooking: (id: string): Promise<WallBooking> => services.cancelMuralBooking(id),
  updateBookingStatus: (id: string, status: 'confirmed' | 'declined'): Promise<WallBooking> =>
    services.updateMuralStatus(id, status),
  confirmBooking: (id: string): Promise<WallBooking> => services.updateMuralStatus(id, 'confirmed'),
  declineBooking: (id: string): Promise<WallBooking> => services.updateMuralStatus(id, 'declined'),

  // Orders & Activity
  getOrders: (): Promise<Order[]> => services.listOrders(),
  cancelOrder: (id: string): Promise<Order> => services.cancelOrder(id),
  getAdminMetrics: (): Promise<AdminMetrics> => services.getAdminMetrics(),
  getActivity: (): Promise<ActivityItem[]> => services.getActivityLog()
};
