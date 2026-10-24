import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminMetrics, User } from '../../api/types';
import { api } from '../../api/client';
import {
  Palette,
  Calendar,
  Layers,
  ShoppingBag,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  user: User | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const m = await api.getAdminMetrics();
        setMetrics(m);
      } catch {}
      setLoading(false);
    };
    fetchMetrics();
  }, []);

  return (
    <AdminLayout user={user}>
      <div className="space-y-8 max-w-6xl">
        <div className="space-y-1">
          <span className="text-xs font-mono text-[#FF6A3D] uppercase tracking-wider block">
            Studio Operations Overview
          </span>
          <h1 className="text-3xl font-serif-display font-bold text-white">
            Administrative Control Desk
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Real-time inventory levels, pending customer requests, and commission workflow status.
          </p>
        </div>

        {/* Real Count Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Paintings Count Tile */}
          <div className="p-5 rounded-2xl bg-[#273469] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Paintings</span>
              <Palette className="w-4 h-4 text-[#273469]" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {metrics ? metrics.paintings.total : '—'}
            </div>
            <div className="text-xs font-mono text-zinc-400 flex justify-between pt-2 border-t border-white/5">
              <span className="text-emerald-400">
                {metrics ? metrics.paintings.available : 0} Available
              </span>
              <span className="text-rose-400">
                {metrics ? metrics.paintings.sold : 0} Sold
              </span>
            </div>
          </div>

          {/* Mural Bookings Count Tile */}
          <div className="p-5 rounded-2xl bg-[#273469] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Mural Bookings</span>
              <Calendar className="w-4 h-4 text-[#5CE1E6]" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {metrics ? metrics.bookings.total : '—'}
            </div>
            <div className="text-xs font-mono text-zinc-400 flex justify-between pt-2 border-t border-white/5">
              <span className="text-amber-400">
                {metrics ? metrics.bookings.requested : 0} Pending
              </span>
              <span className="text-emerald-400">
                {metrics ? metrics.bookings.confirmed : 0} Confirmed
              </span>
            </div>
          </div>

          {/* Pottery Commissions Count Tile */}
          <div className="p-5 rounded-2xl bg-[#273469] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Pottery Orders</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {metrics ? metrics.pottery.total : '—'}
            </div>
            <div className="text-xs font-mono text-zinc-400 flex justify-between pt-2 border-t border-white/5">
              <span className="text-amber-400">
                {metrics ? metrics.pottery.requested : 0} Pending
              </span>
              <span className="text-emerald-400">
                {metrics ? metrics.pottery.accepted : 0} Accepted
              </span>
            </div>
          </div>

          {/* Painting Sales Count Tile */}
          <div className="p-5 rounded-2xl bg-[#273469] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Sales Audit</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              {metrics ? metrics.orders.total : '—'}
            </div>
            <div className="text-xs font-mono text-zinc-400 flex justify-between pt-2 border-t border-white/5">
              <span className="text-emerald-400">
                {metrics ? metrics.orders.placed : 0} Active
              </span>
              <span className="text-zinc-500">
                {metrics ? metrics.orders.cancelled : 0} Cancelled
              </span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts / Alerts */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
            Pending Action Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics && metrics.bookings.requested > 0 && (
              <Link
                to="/admin/bookings"
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:border-amber-500/50 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {metrics.bookings.requested} Wall Mural {metrics.bookings.requested === 1 ? 'Booking' : 'Bookings'} Awaiting Review
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">Click to confirm or decline dates</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {metrics && metrics.pottery.requested > 0 && (
              <Link
                to="/admin/pottery"
                className="p-4 rounded-xl bg-[#273469]/10 border border-[#273469]/25 hover:border-[#273469]/50 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#273469]" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {metrics.pottery.requested} Pottery {metrics.pottery.requested === 1 ? 'Commission' : 'Commissions'} Awaiting Review
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">Review glaze & kiln scheduling</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#273469] group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {(!metrics || (metrics.bookings.requested === 0 && metrics.pottery.requested === 0)) && (
              <div className="col-span-2 p-5 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-zinc-400 text-center">
                All client commissions are up-to-date. No pending reviews awaiting staff action.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
