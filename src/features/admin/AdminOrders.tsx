import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Order, User } from '../../api/types';
import { listOrders } from '../../services';
import { formatINR } from '../../demo-data/store';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Truck,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminOrdersProps {
  user: User | null;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await listOrders();
        setOrders(data);
      } catch {}
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <AdminLayout user={user}>
      <div className="space-y-6 max-w-6xl">
        <div className="pb-4 border-b border-white/10 space-y-1">
          <span className="text-[10px] font-mono-hud text-[#087E8B] uppercase tracking-widest font-semibold block">
            Read-Only Sales Audit
          </span>
          <h1 className="text-3xl font-display font-light text-white tracking-wide">
            Acquisitions & Shipping Audit
          </h1>
          <p className="text-xs text-[#E3D0BE]">
            Immutable chronological audit of all painting acquisitions. Administrative cancellations are disabled by studio protocol.
          </p>
        </div>

        {/* Read-Only Table (Strictly NO cancel button anywhere in admin) */}
        <div className="rounded-[24px] border border-white/10 overflow-hidden bg-[#273469] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans-ui">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[#E3D0BE] uppercase tracking-wider text-[11px] font-mono-hud">
                  <th className="py-3.5 px-4">Ref ID</th>
                  <th className="py-3.5 px-4">Artwork</th>
                  <th className="py-3.5 px-4">Collector</th>
                  <th className="py-3.5 px-4">Shipping Destination</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#E3D0BE] font-mono-hud text-xs">
                      Loading audit records...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#E3D0BE] font-mono-hud text-xs">
                      No acquisition records found.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono-hud text-[#F4A900] text-[11px]">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ord.paintingImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate max-w-[180px]">
                              {ord.paintingTitle}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono-hud">
                              {ord.paintingId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{ord.customerName}</div>
                        <div className="text-[10px] text-[#E3D0BE] font-mono-hud">{ord.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        {ord.shipping ? (
                          <div className="text-[11px] text-[#E3D0BE] space-y-0.5">
                            <div className="text-white font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#087E8B]" />
                              <span>{ord.shipping.fullName} ({ord.shipping.phone})</span>
                            </div>
                            <div className="truncate">{ord.shipping.line1}{ord.shipping.line2 ? `, ${ord.shipping.line2}` : ''}</div>
                            <div className="font-mono-hud text-[10px] text-zinc-400">
                              {ord.shipping.city}, {ord.shipping.state} — {ord.shipping.pincode}
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">No address recorded</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono-hud font-semibold text-[#087E8B]">
                        {formatINR(ord.price || ord.pricePaid || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-hud font-bold uppercase ${
                            ord.status === 'placed'
                              ? 'bg-[#FFD65A]/20 text-[#FFD65A] border border-[#FFD65A]/30'
                              : 'bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${ord.status === 'placed' ? 'bg-[#FFD65A]' : 'bg-[#FF5C5C]'}`} />
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-[11px] font-mono-hud text-[#E3D0BE]">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
