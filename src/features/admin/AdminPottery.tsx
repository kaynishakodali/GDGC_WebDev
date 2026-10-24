import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { PotteryRequest, User } from '../../api/types';
import { api } from '../../api/client';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface AdminPotteryProps {
  user: User | null;
}

export const AdminPottery: React.FC<AdminPotteryProps> = ({ user }) => {
  const [requests, setRequests] = useState<PotteryRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'accept' | 'decline' } | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getPotteryRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load pottery requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async () => {
    if (!actionTarget) return;
    setProcessing(true);
    setError(null);

    try {
      if (actionTarget.action === 'accept') {
        await api.acceptPotteryRequest(actionTarget.id);
      } else {
        await api.declinePotteryRequest(actionTarget.id);
      }
      setActionTarget(null);
      await loadRequests();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <AdminLayout user={user}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-serif-display font-bold text-white">
              Pottery Commissions
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              Review custom hand-turned earthenware requests, glaze recipes, and kiln scheduling.
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
          {['all', 'requested', 'accepted', 'declined', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md transition-all capitalize ${
                statusFilter === s
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s} {s !== 'all' && `(${requests.filter((r) => r.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Dense Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#273469] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Glaze Finish</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Needed By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => {
                  const isPending = r.status === 'requested';
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{r.itemName}</div>
                        <div className="text-[10px] text-zinc-500">#{r.id}</div>
                        {r.notes && <div className="mt-2 max-w-xs whitespace-pre-wrap break-words text-[11px] font-normal text-[#E3D0BE]">Custom details: {r.notes}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-sans text-white">{r.customerName}</div>
                        <div className="text-[10px] text-zinc-500">{r.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-[#273469] font-semibold">{r.glazeName}</td>
                      <td className="py-3 px-4 font-bold text-white">{r.quantity} pcs</td>
                      <td className="py-3 px-4 text-zinc-300">{r.neededByDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            r.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : r.status === 'requested'
                              ? 'bg-amber-500/20 text-amber-300'
                              : r.status === 'declined'
                              ? 'bg-zinc-500/20 text-zinc-400'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActionTarget({ id: r.id, action: 'accept' })}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1"
                              title="Accept into production"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => setActionTarget({ id: r.id, action: 'decline' })}
                              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1"
                              title="Decline request"
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
                {actionTarget.action} Pottery Commission
              </h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to {actionTarget.action} commission #{actionTarget.id}?
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
                    actionTarget.action === 'accept' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
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
