import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandBar } from '../../components/BrandBar';
import { User, Order, WallBooking, PotteryRequest } from '../../api/types';
import {
  listOrders,
  listMuralBookings,
  listPotteryRequests,
  cancelOrder,
  cancelMuralBooking,
  cancelPotteryRequest
} from '../../services';
import {
  formatINR,
  getKolkataDate,
  formatDateToKolkata,
  addDaysToDate
} from '../../demo-data/store';
import {
  ShoppingBag,
  Calendar,
  Layers,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  X,
  Edit2,
  Truck,
  RotateCcw
} from 'lucide-react';

interface AccountDashboardProps {
  user: User | null;
}

export const AccountDashboardPage: React.FC<AccountDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'pottery'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<WallBooking[]>([]);
  const [potteryRequests, setPotteryRequests] = useState<PotteryRequest[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [cancelModalItem, setCancelModalItem] = useState<{
    type: 'order' | 'booking' | 'pottery';
    id: string;
    title: string;
    details: string;
  } | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const todayStr = formatDateToKolkata(getKolkataDate());

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ords, bks, pots] = await Promise.all([
        listOrders(),
        listMuralBookings(),
        listPotteryRequests()
      ]);
      setOrders(ords);
      setBookings(bks);
      setPotteryRequests(pots);
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Could not load collector records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setCancelling(true);
    setCancelError(null);

    try {
      if (cancelModalItem.type === 'order') {
        await cancelOrder(cancelModalItem.id);
      } else if (cancelModalItem.type === 'booking') {
        await cancelMuralBooking(cancelModalItem.id);
      } else if (cancelModalItem.type === 'pottery') {
        await cancelPotteryRequest(cancelModalItem.id);
      }
      setCancelModalItem(null);
      await loadData();
    } catch (err: any) {
      setCancelError(err?.error?.message || err?.message || 'Failed to cancel item.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col font-sans-ui relative overflow-hidden">
      {/* Background Aurora */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/3 w-[500px] h-[500px] rounded-full bg-[#087E8B]/40 blur-[140px] animate-aurora-1" />
      </div>

      <BrandBar user={user} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 py-8 relative z-10 space-y-8">
        {/* Header Profile Greeting */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono-hud text-[#F4A900] uppercase tracking-widest block mb-1">
              Private Collector Provenance
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-light text-white tracking-wide">
              {user?.name ? `${user.name}’s Collection` : 'Collector Space'}
            </h1>
            <p className="text-xs text-[#E3D0BE] mt-1 font-mono-hud">
              {user?.email}
            </p>
          </div>

          {/* Navigation Tabs with Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#273469] border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#F4A900] text-[#28201C] shadow-md'
                  : 'text-[#E3D0BE] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Acquisitions ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#F4A900] text-[#28201C] shadow-md'
                  : 'text-[#E3D0BE] hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Murals ({bookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pottery')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pottery'
                  ? 'bg-[#F4A900] text-[#28201C] shadow-md'
                  : 'text-[#E3D0BE] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pottery ({potteryRequests.length})</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-[#FF5C5C] text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── TAB 1: PAINTING ACQUISITIONS ── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-[28px] bg-[#273469]/60 border border-white/10 p-12 text-center space-y-4">
                <p className="font-display text-2xl text-white">Nothing here yet. Step into the gallery.</p>
                <p className="text-xs text-[#E3D0BE] max-w-sm mx-auto">
                  You have not yet acquired an original painting from the studio collection.
                </p>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F4A900] text-[#28201C] font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  <span>Explore Exhibition</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-[24px] bg-[#273469]/70 backdrop-blur-md border border-white/10 p-6 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="flex gap-4 items-start">
                      <img
                        src={ord.paintingImage}
                        alt={ord.paintingTitle}
                        className="w-20 h-20 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono-hud text-zinc-500">
                            {ord.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-hud font-bold uppercase ${
                              ord.status === 'placed'
                                ? 'bg-[#FFD65A]/20 text-[#FFD65A] border border-[#FFD65A]/30'
                                : 'bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/30'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <h4 className="font-display font-light text-lg text-white truncate mt-1">
                          {ord.paintingTitle}
                        </h4>
                        <p className="font-mono-hud font-semibold text-sm text-[#087E8B] mt-0.5">
                          {formatINR(ord.price || ord.pricePaid || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Shipping Address (Preserved and shown on order) */}
                    {ord.shipping && (
                      <div className="p-3 rounded-xl bg-[#28201C]/60 border border-white/5 text-[11px] text-[#E3D0BE] space-y-1">
                        <span className="text-white font-medium flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#F4A900]" />
                          <span>Delivery Address:</span>
                        </span>
                        <p>{ord.shipping.fullName} • {ord.shipping.phone}</p>
                        <p>{ord.shipping.line1}{ord.shipping.line2 ? `, ${ord.shipping.line2}` : ''}</p>
                        <p>{ord.shipping.city}, {ord.shipping.state} — {ord.shipping.pincode}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 text-[11px] font-mono-hud">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>

                      {ord.status === 'placed' && (
                        <button
                          onClick={() =>
                            setCancelModalItem({
                              type: 'order',
                              id: ord.id,
                              title: `Cancel Acquisition of "${ord.paintingTitle}"?`,
                              details: 'Note: Cancelling this acquisition immediately restores the original painting to "Available" in the gallery for other collectors.'
                            })
                          }
                          className="px-3.5 py-1.5 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
                        >
                          Cancel order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: WALL BOOKINGS ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="rounded-[28px] bg-[#273469]/60 border border-white/10 p-12 text-center space-y-4">
                <p className="font-display text-2xl text-white">Nothing here yet. Step into the gallery.</p>
                <p className="text-xs text-[#E3D0BE] max-w-sm mx-auto">
                  You have not scheduled any architectural wall murals yet.
                </p>
                <Link
                  to="/wall"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F4A900] text-[#28201C] font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  <span>Plan a Wall Mural</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookings.map((bk) => {
                  const lockDateStr = addDaysToDate(bk.date, -3);
                  const isPastWindow = todayStr > lockDateStr;
                  const canCancel = (bk.status === 'requested' || bk.status === 'confirmed') && !isPastWindow;

                  return (
                    <div
                      key={bk.id}
                      className="rounded-[24px] bg-[#273469]/70 backdrop-blur-md border border-white/10 p-6 space-y-4 shadow-xl flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono-hud text-zinc-500">{bk.id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-hud font-bold uppercase ${
                              bk.status === 'confirmed'
                                ? 'bg-[#FFD65A]/20 text-[#FFD65A] border border-[#FFD65A]/30'
                                : bk.status === 'requested'
                                ? 'bg-[#087E8B]/20 text-[#087E8B] border border-[#087E8B]/30'
                                : 'bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/30'
                            }`}
                          >
                            {bk.status}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-mono-hud text-[#E3D0BE] block">Scheduled Date</span>
                          <h4 className="font-display text-2xl font-light text-white">{bk.date}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono-hud pt-2 border-t border-white/10">
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Area</span>
                            <span className="text-white font-semibold">{bk.sizeSqFt} sq ft</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Estimated Price</span>
                            <span className="text-[#087E8B] font-semibold">{formatINR(bk.totalPrice)}</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#28201C]/60 border border-white/5 text-[11px] text-[#E3D0BE]">
                          <span className="text-white font-medium block">Site Location:</span>
                          <p className="line-clamp-2 mt-0.5">{bk.address}</p>
                        </div>
                      </div>

                      {/* Cancel Action */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        {canCancel ? (
                          <button
                            onClick={() =>
                              setCancelModalItem({
                                type: 'booking',
                                id: bk.id,
                                title: `Cancel Mural Booking for ${bk.date}?`,
                                details: 'Are you sure you want to release this date? The calendar slot will immediately reopen for other clients.'
                              })
                            }
                            className="px-3.5 py-1.5 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
                          >
                            Cancel booking
                          </button>
                        ) : bk.status === 'requested' || bk.status === 'confirmed' ? (
                          <span className="text-[11px] text-zinc-500 italic">
                            Cancellation closed 3 days before your date
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500 capitalize">{bk.status}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: POTTERY REQUESTS ── */}
        {activeTab === 'pottery' && (
          <div className="space-y-4">
            {potteryRequests.length === 0 ? (
              <div className="rounded-[28px] bg-[#273469]/60 border border-white/10 p-12 text-center space-y-4">
                <p className="font-display text-2xl text-white">Nothing here yet. Step into the gallery.</p>
                <p className="text-xs text-[#E3D0BE] max-w-sm mx-auto">
                  You have not submitted any custom pottery commissions.
                </p>
                <Link
                  to="/pottery"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F4A900] text-[#28201C] font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  <span>Request Custom Pottery</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {potteryRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-[24px] bg-[#273469]/70 backdrop-blur-md border border-white/10 p-6 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-hud text-zinc-500">{req.id}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-hud font-bold uppercase ${
                            req.status === 'accepted'
                              ? 'bg-[#FFD65A]/20 text-[#FFD65A] border border-[#FFD65A]/30'
                              : req.status === 'requested'
                              ? 'bg-[#087E8B]/20 text-[#087E8B] border border-[#087E8B]/30'
                              : 'bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <h4 className="font-display text-xl font-light text-white">
                        {req.itemName}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono-hud pt-2 border-t border-white/10">
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Glaze Finish</span>
                          <span className="text-white font-medium">{req.glazeName}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Quantity</span>
                          <span className="text-white font-medium">{req.quantity} pieces</span>
                        </div>
                      </div>

                      {req.notes && (
                        <div className="rounded-xl bg-[#28201C]/60 border border-white/5 p-3 text-xs">
                          <span className="text-[#E3D0BE]">Engraving or custom details</span>
                          <p className="mt-1 whitespace-pre-wrap break-words text-white">{req.notes}</p>
                        </div>
                      )}
                      <div className="p-3 rounded-xl bg-[#28201C]/60 border border-white/5 text-[11px] text-[#E3D0BE] flex justify-between items-center">
                        <span>Target Delivery Date:</span>
                        <span className="font-mono-hud text-white font-semibold">{req.neededByDate}</span>
                      </div>
                    </div>

                    {/* Actions: Edit / Cancel allowed ONLY while 'requested' */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      {req.status === 'requested' ? (
                        <div className="flex items-center gap-2 w-full justify-end">
                          <Link
                            to={`/pottery/${req.id}/edit`}
                            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#F4A900]" />
                            <span>Edit request</span>
                          </Link>
                          <button
                            onClick={() =>
                              setCancelModalItem({
                                type: 'pottery',
                                id: req.id,
                                title: `Withdraw Request for ${req.itemName}?`,
                                details: 'Are you sure you want to cancel this commission inquiry from the studio queue?'
                              })
                            }
                            className="px-3.5 py-1.5 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic ml-auto capitalize">
                          {req.status === 'accepted' ? 'Committed in Atelier' : req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Cancellation */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] bg-[#273469] border border-white/15 p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-display text-white">{cancelModalItem.title}</h3>
            <p className="text-xs text-[#E3D0BE] leading-relaxed">{cancelModalItem.details}</p>

            {cancelError && (
              <p className="text-xs text-[#FF5C5C] font-mono-hud">{cancelError}</p>
            )}

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancelModalItem(null)}
                className="px-5 py-2.5 rounded-full border border-white/15 text-xs text-white hover:bg-white/5 cursor-pointer"
              >
                Keep Active
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
