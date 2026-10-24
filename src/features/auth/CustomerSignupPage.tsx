import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandBar } from '../../components/BrandBar';
import { authService } from '../../services';
import { User } from '../../api/types';
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Check, Sparkles, Eye, EyeOff } from 'lucide-react';

interface SignupPageProps {
  user: User | null;
  onLoginSuccess: (user: User) => void;
}

export const CustomerSignupPage: React.FC<SignupPageProps> = ({ user, onLoginSuccess }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 5
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password.length < 6) {
      setFieldErrors({ password: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);

    try {
      const newUser = await authService.signup(name, email, password);
      onLoginSuccess(newUser);
      navigate('/gallery');
    } catch (err: any) {
      if (err?.error?.fields) {
        setFieldErrors(err.error.fields);
      }
      setError(err?.error?.message || err?.message || 'Registration failed. Please check the inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F6F3E9] flex flex-col font-sans-ui relative overflow-hidden">
      {/* Background Aurora Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#103B46]/60 blur-[130px] animate-aurora-1" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#0B2633]/80 blur-[120px] animate-aurora-2" />
      </div>

      <BrandBar user={user} />

      <main className="flex-1 flex items-center justify-center p-5 sm:p-8 relative z-10">
        <div className="w-full max-w-md bg-[#0B2633]/75 backdrop-blur-2xl border border-white/10 rounded-[24px] p-7 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#579AFF] via-[#42E4D0] to-[#68C6B7]" />

          <div className="space-y-2">
            <span className="text-[11px] font-mono-hud text-[#42E4D0] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              New Collector Membership
            </span>
            <h2 className="text-3xl font-display font-light text-[#F6F3E9] tracking-wide">
              Join the Atelier
            </h2>
            <p className="text-xs text-[#B7D6D3] leading-relaxed">
              Create an account to preserve provenance of your acquired paintings and bespoke commissions.
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
              <label className="block text-xs font-medium text-[#B7D6D3] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#B7D6D3] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full bg-[#06111D]/60 border border-white/15 focus:border-[#42E4D0] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F6F3E9] placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-[#42E4D0]"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-[#FF5C5C] mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B7D6D3] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#B7D6D3] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full bg-[#06111D]/60 border border-white/15 focus:border-[#42E4D0] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F6F3E9] placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-[#42E4D0]"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-[#FF5C5C] mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B7D6D3] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B7D6D3] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#06111D]/60 border border-white/15 focus:border-[#42E4D0] rounded-xl py-2.5 pl-10 pr-12 text-sm text-[#F6F3E9] placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-[#42E4D0]"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#B7D6D3] transition-colors hover:text-[#42E4D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42E4D0]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-[#FF5C5C] mt-1">{fieldErrors.password}</p>
              )}

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1.5 h-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all ${
                          strength >= level
                            ? strength <= 2
                              ? 'bg-[#FF5C5C]'
                              : strength <= 3
                              ? 'bg-[#579AFF]'
                              : 'bg-[#F3C96B]'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#B7D6D3]">
                    Strength:{' '}
                    {strength <= 2 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong & Secure'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-[#42E4D0] hover:bg-[#31C8C3] text-[#06111D] font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#42E4D0]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#B7D6D3]">
            <span>Already have an account?</span>
            <Link to="/login" className="text-[#42E4D0] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
