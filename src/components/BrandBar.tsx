import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { User } from '../api/types';
import { authService } from '../services';
import {
  LogOut,
  ShieldAlert,
  Compass,
  Palette,
  Layers,
  ShoppingBag
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
  const isAdmin = user?.role === 'admin' || user?.role === 'studio';

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
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42E4D0] rounded-2xl transition-transform active:scale-95"
          title="Return to Home"
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
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#06111D]/90 backdrop-blur-xl px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between transition-all">
      {/* Brand Logo & Wordmark (at least 56px desktop / 40px mobile) */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42E4D0] rounded-2xl group transition-transform active:scale-95"
          title="OBSURA — There's more that meets the eye"
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
          <nav className="hidden md:flex items-center gap-1.5 font-sans-ui text-xs font-medium text-[#B7D6D3]">
            <Link
              to="/gallery"
              className={`px-3.5 py-2 rounded-full transition-all ${
                location.pathname.startsWith('/gallery')
                  ? 'text-[#F6F3E9] bg-white/[0.08] shadow-sm font-semibold border border-white/10'
                  : 'hover:text-[#F6F3E9] hover:bg-white/[0.04]'
              }`}
            >
              Exhibition
            </Link>
            <Link
              to="/wall"
              className={`px-3.5 py-2 rounded-full transition-all ${
                location.pathname === '/wall'
                  ? 'text-[#F6F3E9] bg-white/[0.08] shadow-sm font-semibold border border-white/10'
                  : 'hover:text-[#F6F3E9] hover:bg-white/[0.04]'
              }`}
            >
              Mural Commission
            </Link>
            <Link
              to="/pottery"
              className={`px-3.5 py-2 rounded-full transition-all ${
                location.pathname.startsWith('/pottery')
                  ? 'text-[#F6F3E9] bg-white/[0.08] shadow-sm font-semibold border border-white/10'
                  : 'hover:text-[#F6F3E9] hover:bg-white/[0.04]'
              }`}
            >
              Pottery Atelier
            </Link>
            {user && (
              <Link
                to="/account"
                className={`px-3.5 py-2 rounded-full transition-all ${
                  location.pathname === '/account'
                    ? 'text-[#F6F3E9] bg-white/[0.08] shadow-sm font-semibold border border-white/10'
                    : 'hover:text-[#F6F3E9] hover:bg-white/[0.04]'
                }`}
              >
                Collector Space
              </Link>
            )}
          </nav>
        )}
      </div>

      {/* Right actions: User context or Sign in */}
      <div className="flex items-center gap-3 font-sans-ui">
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-[#F6F3E9] font-medium truncate max-w-[150px]">
                {user.name}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-[#B7D6D3]">
                {isAdmin ? 'Studio Admin' : 'Collector'}
              </span>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 text-xs rounded-full bg-[#579AFF]/10 border border-[#579AFF]/30 text-[#579AFF] hover:bg-[#579AFF]/20 transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Desk</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#B7D6D3] hover:text-[#F6F3E9] border border-white/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#B7D6D3] hover:text-[#F6F3E9] hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#42E4D0] hover:bg-[#31C8C3] text-[#06111D] shadow-md shadow-[#42E4D0]/20 transition-all"
            >
              Join Atelier
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
