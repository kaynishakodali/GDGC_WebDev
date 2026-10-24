import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { WallBooking, User } from '../../api/types';
import { api } from '../../api/client';
import { formatINR } from '../../mock/mockStore';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface AdminBookingsProps {
  user: User | null;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({ user }) => {
  const [bookings, setBookings] = useState<WallBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Confirmation dialog
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'confirm' | 'decline' } | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAction = async () => {
    if (!actionTarget) return;
    setProcessing(true);
    setError(null);

    try {
      if (actionTarget.action === 'confirm') {
        await api.confirmBooking(actionTarget.id);
      } else {
        await api.declineBooking(actionTarget.id);
      }
      setActionTarget(null);
      await loadBookings();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <AdminLayout user={user}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-serif-display font-bold text-white">
              Wall Mural Bookings
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              Review on-site mural requests, confirm artist schedules, and manage dates.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between font-mono">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-[#273469] border border-white/10 font-mono text-xs overflow-x-auto">
          <span className="text-zinc-500 mr-2">Filter Status:</span>
          {['all', 'requested', 'confirmed', 'declined', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md transition-all capitalize ${
                statusFilter === s
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s} {s !== 'all' && `(${bookings.filter((b) => b.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Dense Bookings Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#273469] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date & Ref</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Size & Rate</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Location Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((b) => {
                  const isPending = b.status === 'requested';
                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{b.date}</div>
                        <div className="text-[10px] text-zinc-500">#{b.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-sans text-white">{b.customerName}</div>
                        <div className="text-[10px] text-zinc-500">{b.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{b.sizeSqFt} sq ft</div>
                        <div className="text-[10px] text-zinc-500">₹{b.ratePerSqFt}/sq ft</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {formatINR(b.totalPrice)}
                      </td>
                      <td className="py-3 px-4 max-w-xs font-sans text-zinc-300 truncate" title={b.address}>
                        {b.address}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : b.status === 'requested'
                              ? 'bg-amber-500/20 text-amber-300'
                              : b.status === 'declined'
                              ? 'bg-zinc-500/20 text-zinc-400'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActionTarget({ id: b.id, action: 'confirm' })}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1"
                              title="Confirm Booking"
                            >
                              <Check className="w-3 h-3" />
                              <span>Confirm</span>
                            </button>
                            <button
                              onClick={() => setActionTarget({ id: b.id, action: 'decline' })}
                              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1"
                              title="Decline Booking"
                            >
                              <X className="w-3 h-3" />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {actionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
            <div className="w-full max-w-sm bg-[#273469] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white capitalize">
                {actionTarget.action} Mural Reservation
              </h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to {actionTarget.action} booking #{actionTarget.id}? The customer will see this state updated immediately.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActionTarget(null)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={processing}
                  className={`flex-1 py-2 rounded-xl text-white text-xs font-bold transition-all ${
                    actionTarget.action === 'confirm' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {processing ? 'Processing...' : `Confirm ${actionTarget.action}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
