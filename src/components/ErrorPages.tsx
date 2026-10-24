import React from 'react';
import { Link } from 'react-router-dom';
import { BrandBar } from './BrandBar';
import { Logo } from './Logo';
import { User } from '../api/types';
import { ShieldAlert, Compass, ArrowLeft, Home, Lock } from 'lucide-react';

interface ErrorPageProps {
  user: User | null;
}

export const NotFoundPage: React.FC<ErrorPageProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col font-sans">
      <BrandBar user={user} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
          <Logo variant="mark" size={32} />
        </div>
        <div className="font-mono text-xs text-[#273469] uppercase tracking-[0.2em] mb-2">
          Error 404 — Void
        </div>
        <h1 className="font-serif-display text-4xl sm:text-5xl font-normal tracking-tight mb-4 text-white">
          Beyond the Frame
        </h1>
        <p className="max-w-md text-sm text-zinc-400 font-sans leading-relaxed mb-8">
          The requested room or canvas does not exist in our current collection or has been archived.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/gallery"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#273469] hover:bg-[#6CBBD4] text-white font-mono text-xs font-medium shadow-lg transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Enter Gallery</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-mono text-xs border border-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ForbiddenPage: React.FC<ErrorPageProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col font-sans">
      <BrandBar user={user} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400 shadow-2xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="font-mono text-xs text-amber-400 uppercase tracking-[0.2em] mb-2">
          Error 403 — Restricted Atelier
        </div>
        <h1 className="font-serif-display text-4xl sm:text-5xl font-normal tracking-tight mb-4 text-white">
          Studio Staff Only
        </h1>
        <p className="max-w-md text-sm text-zinc-400 font-sans leading-relaxed mb-8">
          You do not have administrative clearance to access this desk. Sign in with curator credentials or return to public view.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/admin/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-medium transition-all shadow-md"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Curator Desk Sign In</span>
          </Link>
          <Link
            to="/gallery"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-mono text-xs border border-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Gallery</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
