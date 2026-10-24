import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { User } from '../../api/types';
import { authService } from '../../services';
import {
  LayoutDashboard,
  Palette,
  Calendar,
  Layers,
  ShoppingBag,
  Activity,
  LogOut,
  ExternalLink,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  user: User | null;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ user, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/admin/login');
    } catch {}
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/admin/paintings', label: 'Paintings Inventory', icon: Palette },
    { path: '/admin/bookings', label: 'Mural Bookings', icon: Calendar },
    { path: '/admin/pottery', label: 'Pottery Commissions', icon: Layers },
    { path: '/admin/orders', label: 'Sales Audit (Orders)', icon: ShoppingBag },
    { path: '/admin/activity', label: 'Activity Feed', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col md:flex-row font-sans-ui selection:bg-[#F4A900]/30">
      {/* ── Left Sidebar Navigation (Calm, Dense, Clean) ── */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 bg-[#273469]/80 backdrop-blur-md flex flex-col justify-between p-6 sm:p-7 flex-shrink-0">
        <div className="space-y-8">
          {/* Top-Left Big Eclipse Logo (at least 56px desktop / 40px mobile) */}
          <div className="pb-6 border-b border-white/10 flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-3" title="Return to public gallery">
              <div className="hidden sm:block">
                <Logo variant="full" size={56} />
              </div>
              <div className="sm:hidden">
                <Logo variant="full" size={40} />
              </div>
            </Link>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono-hud px-2.5 py-0.5 rounded-full bg-[#087E8B]/15 text-[#087E8B] border border-[#087E8B]/30 uppercase font-semibold">
                Studio Admin Desk
              </span>
              <span className="text-[10px] font-mono-hud text-zinc-500">
                Staff Only
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-sm'
                      : 'text-[#E3D0BE] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F4A900]' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Clearance & Exit */}
        <div className="pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="min-w-0">
              <div className="font-semibold text-white truncate max-w-[150px]">
                {user?.name || 'Studio Curator'}
              </div>
              <div className="text-[10px] font-mono-hud text-[#E3D0BE] truncate">
                {user?.email || 'studio@artstudio.in'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out of Admin Desk"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#E3D0BE] hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/gallery"
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#E3D0BE] hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>View Public Gallery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* ── Main Content View ── */}
      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};
