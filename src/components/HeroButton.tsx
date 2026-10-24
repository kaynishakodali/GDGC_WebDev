import React from 'react';
import { ArrowUpRight, Lock } from 'lucide-react';

interface HeroButtonProps {
  label: string;
  icon: 'arrow' | 'lock';
  accentColor: 'lilac' | 'peach';
  onClick: () => void;
  className?: string;
}

export const HeroButton: React.FC<HeroButtonProps> = ({ label, icon, accentColor, onClick, className = '' }) => {
  const accent = accentColor === 'lilac' ? '#F4A900' : '#E34234';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ '--button-accent': accent } as React.CSSProperties}
      className={`group relative w-full sm:w-64 min-h-14 rounded-full font-sans-ui text-sm font-semibold text-[#FFF5E6] border border-white/15 bg-[#273469]/90 px-5 transition duration-200 ease-out hover:-translate-y-1 hover:scale-[1.025] hover:border-[var(--button-accent)] hover:bg-[color-mix(in_srgb,var(--button-accent)_18%,#273469)] hover:shadow-[0_12px_36px_color-mix(in_srgb,var(--button-accent)_22%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-accent)] active:translate-y-0 active:scale-[0.99] ${className}`}
    >
      <span className="flex items-center justify-between gap-5">
        <span>{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.07] text-[var(--button-accent)] transition-colors group-hover:bg-[var(--button-accent)] group-hover:text-[#28201C]">
          {icon === 'arrow' ? <ArrowUpRight className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
        </span>
      </span>
    </button>
  );
};
