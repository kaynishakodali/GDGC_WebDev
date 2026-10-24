export type UserRole = 'customer' | 'studio';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Painting {
  id: string;
  title: string;
  artist: string;
  description: string;
  price: number;
  imageUrl: string;
  status: 'available' | 'sold';
  saleMode?: 'fixed' | 'auction';
  auctionEndsAt?: string | null;
  currentBid?: number | null;
  bidCount?: number;
  auctionOpen?: boolean;
  isHighestBidder?: boolean;
}

export interface PotteryItem {
  id: string;
  name: string;
}

export interface Glaze {
  id: string;
  name: string;
}

export interface MuralConfig {
  ratePerSqFt: number;
  currency?: string;
}

export interface ShippingAddress {
  fullName?: string;
  phone: string;
  line1?: string;
  line2?: string;
  street?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  paintingId: string;
  painting?: Painting;
  paintingTitle?: string;
  paintingImage?: string;
  customerId?: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  price?: number;
  pricePaid?: number;
  currency?: string;
  shipping?: ShippingAddress;
  status: 'placed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface WallBooking {
  id: string;
  customerId?: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  date: string; // YYYY-MM-DD in Asia/Kolkata
  sizeSqFt: number;
  address: string;
  ratePerSqFt: number;
  totalPrice: number;
  currency?: string;
  status: 'requested' | 'confirmed' | 'declined' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface PotteryRequest {
  id: string;
  customerId?: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  itemId: string;
  itemName: string;
  glazeId: string;
  glazeName: string;
  quantity: number;
  neededByDate: string; // YYYY-MM-DD
  notes?: string;
  status: 'requested' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'booking' | 'pottery';
  title?: string;
  action?: string;
  description: string;
  actor?: string;
  timestamp?: string;
  createdAt?: string;
  status?: string;
}

export interface AdminMetrics {
  paintings: {
    total: number;
    available: number;
    sold: number;
  };
  orders: {
    total: number;
    placed: number;
    cancelled: number;
  };
  bookings: {
    total: number;
    requested: number;
    confirmed: number;
    declined: number;
    cancelled: number;
  };
  pottery: {
    total: number;
    requested: number;
    accepted: number;
    declined: number;
    cancelled: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
