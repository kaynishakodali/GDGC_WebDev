import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { ActivityItem, User } from '../../api/types';
import { api } from '../../api/client';
import {
  Activity,
  ShoppingBag,
  Calendar,
  Layers,
  Clock,
  Filter
} from 'lucide-react';

interface AdminActivityProps {
  user: User | null;
}

export const AdminActivity: React.FC<AdminActivityProps> = ({ user }) => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'order' | 'booking' | 'pottery'>('all');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await api.getActivity();
        setActivity(data);
      } catch {}
      setLoading(false);
    };
    fetchActivity();
  }, []);

  const filtered = activity.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-[#273469]" />;
      case 'booking': return <Calendar className="w-4 h-4 text-[#5CE1E6]" />;
      case 'pottery': return <Layers className="w-4 h-4 text-amber-400" />;
      default: return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="space-y-6 max-w-5xl">
        <div className="pb-4 border-b border-white/10 space-y-1">
          <h1 className="text-2xl font-serif-display font-bold text-white">
            Studio Activity Audit Log
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Chronological log of transactions, client mural submissions, and pottery commissions.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-[#273469] border border-white/10 font-mono text-xs overflow-x-auto">
          <span className="text-zinc-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {(['all', 'order', 'booking', 'pottery'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-md transition-all capitalize ${
                typeFilter === t
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Activities' : t}
            </button>
          ))}
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3 font-mono">
          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#273469] border border-white/10 text-center text-xs text-zinc-500">
              No matching activity events recorded.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#273469] border border-white/10 flex items-start gap-4 hover:border-white/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white tracking-wide">{item.action}</span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp || item.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans">{item.description}</p>
                  <div className="text-[10px] text-zinc-500">
                    Initiated by: <span className="text-zinc-400">{item.actor}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
