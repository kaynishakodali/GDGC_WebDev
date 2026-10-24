import React, { useState } from 'react';
import { mockStore } from '../mock/mockStore';
import { User } from '../api/types';
import {
  Wrench,
  X,
  Zap,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Flame,
  Clock,
  Shield,
  Layers
} from 'lucide-react';

interface DevPanelProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  onRefreshData?: () => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({ currentUser, onUserChange, onRefreshData }) => {
  const isDevMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1';

  const [isOpen, setIsOpen] = useState(false);
  const [latency, setLatency] = useState(mockStore.devConfig.latencyMs);
  const [forceError, setForceError] = useState(mockStore.devConfig.forceError);
  const [emptyData, setEmptyData] = useState(mockStore.devConfig.emptyData);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isDevMode) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLatencyChange = (val: number) => {
    setLatency(val);
    mockStore.devConfig.latencyMs = val;
  };

  const toggleForceError = () => {
    const next = !forceError;
    setForceError(next);
    mockStore.devConfig.forceError = next;
    showToast(next ? '500 Server Failure Enabled' : 'Server Restored');
  };

  const toggleEmptyData = () => {
    const next = !emptyData;
    setEmptyData(next);
    mockStore.devConfig.emptyData = next;
    showToast(next ? 'Empty Data State Enabled' : 'Data Restored');
    if (onRefreshData) onRefreshData();
  };

  const handleSimulateSold = (paintingId: string) => {
    mockStore.simulatePaintingSoldElsewhere(paintingId);
    showToast(`Simulated: Painting ${paintingId} bought elsewhere (409 Conflict Trigger)`);
    if (onRefreshData) onRefreshData();
  };

  const handleSimulateDateBooked = (dateStr: string) => {
    mockStore.simulateDateBookedElsewhere(dateStr);
    showToast(`Simulated: Date ${dateStr} booked by someone else`);
    if (onRefreshData) onRefreshData();
  };

  const handleSwitchRole = (role: 'customer' | 'studio') => {
    mockStore.switchRole(role);
    onUserChange(role === 'studio' ? {
      id: 'usr-admin-studio',
      name: 'Studio Admin',
      email: 'studio@artstudio.in',
      role: 'studio'
    } : {
      id: 'usr-customer-demo',
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      role: 'customer'
    });
    showToast(`Switched active role to ${role.toUpperCase()}`);
    if (onRefreshData) onRefreshData();
  };

  const handleExpireSession = () => {
    mockStore.logout();
    onUserChange(null);
    showToast('Session Expired (401 Simulated)');
    if (onRefreshData) onRefreshData();
  };

  const handleResetSeed = () => {
    mockStore.initStore(true);
    showToast('Database reset to fresh seed');
    if (onRefreshData) onRefreshData();
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#10212C]/90 backdrop-blur-md border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/20 text-xs font-mono transition-all shadow-xl shadow-black/80 group"
          title="Open Mock Dev Panel for testing edge cases"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
          <span className="font-semibold">MOCK DEV PANEL</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-amber-500/90 text-black font-mono text-xs font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-14 left-4 z-50 w-80 bg-[#273469] border border-white/15 rounded-2xl p-5 shadow-2xl font-mono text-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Mock Environment Control
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Network Latency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Simulated Latency:</span>
              <span className="text-white font-bold">{latency} ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="50"
              value={latency}
              onChange={(e) => handleLatencyChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>0ms (Instant)</span>
              <span>1500ms (Slow 3G)</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <button
              onClick={toggleForceError}
              className={`w-full py-1.5 px-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                forceError
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <span>Force 500 / Network Error</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleEmptyData}
              className={`w-full py-1.5 px-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                emptyData
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <span>Simulate Empty Data State</span>
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Conflict Trigger for Camera Demo */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
              Simulate Conflicts (409)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSimulateSold('p-001')}
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-[10px] text-left"
                title="Mark p-001 as sold in background"
              >
                Mark p-001 as Sold
              </button>
              <button
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 10);
                  handleSimulateDateBooked(d.toISOString().split('T')[0]);
                }}
                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-[10px] text-left"
                title="Book +10 days date"
              >
                Book Date (+10d)
              </button>
            </div>
          </div>

          {/* Role switcher & Session expiry */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
              Active Session ({currentUser?.role || 'Guest'})
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleSwitchRole('customer')}
                className={`py-1 px-2 rounded text-[10px] border transition-all ${
                  currentUser?.role === 'customer'
                    ? 'bg-[#273469]/20 border-[#273469] text-white font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => handleSwitchRole('studio')}
                className={`py-1 px-2 rounded text-[10px] border transition-all ${
                  currentUser?.role === 'studio'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={handleExpireSession}
                className="py-1 px-2 rounded text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20"
                title="Simulate 401 Unauthorized"
              >
                Expire
              </button>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={handleResetSeed}
              className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 text-[10px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Database to Fresh Seed</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
