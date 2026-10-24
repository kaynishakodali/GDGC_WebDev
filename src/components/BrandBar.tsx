import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { User } from '../api/types';
import { authService } from '../services';
import { useCart } from './CartContext';
import {
  LogOut,
  ShieldAlert,
  Compass,
  Palette,
  Layers,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';

interface BrandBarProps {
  user: User | null;
  overlay?: boolean; // For 3D galaxy mode or landing hero
  onLogout?: () => void;
}

export const BrandBar: React.FC<BrandBarProps> = ({ user, overlay = false, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const { itemIds } = useCart();
  const isAdmin = user?.role === 'studio';

  const handleLogout = async () => {
    try {
      await authService.logout();
      if (onLogout) onLogout();
      navigate('/');
    } catch {}
  };

  if (overlay) {
    return (
      <header className="fixed top-7 left-7 z-50 pointer-events-auto flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A900] rounded-2xl transition-transform active:scale-95"
          title="Return to ARTOPIA"
        >
          {/* Logo 56px on desktop, 40px on mobile */}
          <div className="hidden sm:block">
            <Logo variant="full" size={56} />
          </div>
          <div className="sm:hidden">
            <Logo variant="full" size={40} />
          </div>
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#28201C]/90 backdrop-blur-xl px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between transition-all">
      {/* Brand Logo & Wordmark (at least 56px desktop / 40px mobile) */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A900] rounded-2xl group transition-transform active:scale-95"
          title="ARTOPIA — Rooted in India. Made to Move You."
        >
          <div className="hidden sm:block">
            <Logo variant="full" size={56} />
          </div>
          <div className="sm:hidden">
            <Logo variant="full" size={40} />
          </div>
        </Link>

        {/* Navigation links (Customer / Public) */}
        {!isAdmin && !isLanding && (
          <nav className="hidden md:flex items-center gap-1.5 font-sans-ui text-xs font-medium text-[#E3D0BE]">
            <Link
              to="/gallery"
              className={`px-3.5 py-2 rounded-full transition-all ${
                location.pathname.startsWith('/gallery')
                  ? 'text-[#FFF5E6] bg-white/[0.08] shadow-sm font-semibold border border-white/10'
                  : 'hover:text-[#FFF5E6] hover:bg-white/[0.04]'
              }`}
            >
              Paintings
            </Link>
            <Link
              to="/wall"
              className={`px-3.5 py-2 rounded-full transition-all ${
                location.pathname === '/wall'
                  ? 'text-[#FFF5E6] bg-white/[0.08] shadow-sm font-semibold border border-white/10'
                  : 'hover:text-[#FFF5E6] hover:bg-white/[0.04]'
              }`}
            >
              Wall Murals
            </Link>
            <Link
              to="/pottery"
              className={`px-3.5 py-2 rounded-full transition-all ${
                location.pathname.startsWith('/pottery')
                  ? 'text-[#FFF5E6] bg-white/[0.08] shadow-sm font-semibold border border-white/10'
                  : 'hover:text-[#FFF5E6] hover:bg-white/[0.04]'
              }`}
            >
              Pottery
            </Link>
            {user && (
              <Link
                to="/account"
                className={`px-3.5 py-2 rounded-full transition-all ${
                  location.pathname === '/account'
                    ? 'text-[#FFF5E6] bg-white/[0.08] shadow-sm font-semibold border border-white/10'
                    : 'hover:text-[#FFF5E6] hover:bg-white/[0.04]'
                }`}
              >
                My Activity
              </Link>
            )}
          </nav>
        )}
      </div>

      {/* Right actions: basket, account context or sign in */}
      <div className="flex items-center gap-2 sm:gap-3 font-sans-ui">
        <Link to="/cart" aria-label={`Artwork bag, ${itemIds.length} items`} title="Artwork bag" className="relative grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-[#E3D0BE] transition hover:border-[#FFD65A]/50 hover:text-[#FFD65A]"><ShoppingCart className="h-4 w-4" />{itemIds.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#E34234] px-1 text-[9px] font-bold text-white">{itemIds.length}</span>}</Link>
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-[#FFF5E6] font-medium truncate max-w-[150px]">
                {user.name}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-[#E3D0BE]">
                {isAdmin ? 'Studio Admin' : 'Customer'}
              </span>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 text-xs rounded-full bg-[#087E8B]/10 border border-[#087E8B]/30 text-[#087E8B] hover:bg-[#087E8B]/20 transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Desk</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#E3D0BE] hover:text-[#FFF5E6] border border-white/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#E3D0BE] hover:text-[#FFF5E6] hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F4A900] hover:bg-[#D81B60] text-[#28201C] shadow-md shadow-[#F4A900]/20 transition-all"
            >
              Join ARTOPIA
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
