import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBar } from '../../components/BrandBar';
import { authService } from '../../services';
import { User } from '../../api/types';
import DitherVeil from '../../components/DitherVeil';
import { Lock, Mail, ShieldAlert, ArrowRight, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  user: User | null;
  onLoginSuccess: (user: User) => void;
}

export const AdminLoginPage: React.FC<AdminLoginProps> = ({ user, onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await authService.login(email.trim(), password);

      // Verify admin role returned by service
      if (loggedUser.role !== 'studio') {
        setError("This account can't use this area. Curator credentials required.");
        return;
      }

      onLoginSuccess(loggedUser);
      navigate('/admin');
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Access restricted. Please verify curator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col font-sans-ui relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-auto" aria-hidden="true">
        <div className="absolute inset-0 sm:left-[24%] lg:left-[14%]">
          <DitherVeil
            src="https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop"
            pattern="floyd"
            pixelSize={2}
            inkColor="#120f17"
            paperColor="#f4f1ea"
            revealRadius={200}
            softness={0.6}
            linger={1}
            className="h-full w-full"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#28201C]/95 via-[#28201C]/62 to-[#28201C]/5" />
      </div>
      {/* Background Subtle Ambiance */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#087E8B]/40 blur-[140px]" />
      </div>

      <div className="relative z-20"><BrandBar user={user} /></div>

      <main className="flex-1 flex items-center justify-center p-5 sm:justify-start sm:pl-[5vw] sm:pr-8 lg:pl-[9vw] relative z-10">
        <div className="w-full max-w-md bg-[#273469]/85 backdrop-blur-2xl border border-white/10 rounded-[24px] p-7 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Peach accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#087E8B] via-[#087E8B] to-[#087E8B]" />

          <div className="space-y-2">
            <span className="text-[11px] font-mono-hud text-[#087E8B] uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Restricted Access
            </span>
            <h2 className="text-3xl font-display font-light text-[#FFF5E6] tracking-wide">
              Studio Curator Desk
            </h2>
            <p className="text-xs text-[#E3D0BE] leading-relaxed">
              Curator authorization required for inventory management, commission approvals, and sales auditing.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-[#FF5C5C] text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#E3D0BE] mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#E3D0BE] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="studio@artstudio.in"
                  className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#087E8B] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#FFF5E6] placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-[#087E8B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E3D0BE] mb-1.5">
                Clearance Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#E3D0BE] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#28201C]/60 border border-white/15 focus:border-[#087E8B] rounded-xl py-2.5 pl-10 pr-12 text-sm text-[#FFF5E6] placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-[#087E8B]"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#E3D0BE] transition-colors hover:text-[#087E8B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087E8B]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-[#087E8B] hover:bg-[#F798CC] text-[#28201C] font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#087E8B]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Curator Clearance...</span>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Access Curator Desk</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-zinc-500">
            <span>ARTOPIA Studio Admin • Private Studio Access</span>
          </div>
        </div>
      </main>
    </div>
  );
};
